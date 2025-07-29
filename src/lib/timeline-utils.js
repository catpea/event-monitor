/**
 * Timeline Utility Library
 * A comprehensive set of utilities for timeline visualization and event logging
 * Designed for DevTools panels and performance monitoring
 */

// Time formatting utilities
export const TimeFormat = {
  /**
   * Format milliseconds to human-readable string
   * @param {number} ms - Milliseconds
   * @param {Object} options - Formatting options
   * @returns {string} Formatted time string
   */
  format(ms, options = {}) {
    const { precision = 2, units = 'auto' } = options;

    if (units === 'auto') {
      if (ms < 1) return `${ms.toFixed(precision)}ms`;
      if (ms < 1000) return `${ms.toFixed(precision)}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(precision)}s`;
      return `${(ms / 60000).toFixed(precision)}m`;
    }

    switch (units) {
      case 'ms': return `${ms.toFixed(precision)}ms`;
      case 's': return `${(ms / 1000).toFixed(precision)}s`;
      case 'm': return `${(ms / 60000).toFixed(precision)}m`;
      default: return `${ms.toFixed(precision)}ms`;
    }
  },

  /**
   * Format duration between two timestamps
   * @param {number} start - Start timestamp
   * @param {number} end - End timestamp
   * @returns {string} Formatted duration
   */
  duration(start, end) {
    return this.format(end - start);
  },

  /**
   * Get relative time description
   * @param {number} timestamp - Timestamp to describe
   * @param {number} referenceTime - Reference time (default: now)
   * @returns {string} Relative time description
   */
  relative(timestamp, referenceTime = performance.now()) {
    const diff = referenceTime - timestamp;
    if (diff < 1000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }
};

// Event class for timeline events
export class TimelineEvent {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.timestamp = data.timestamp || performance.now();
    this.type = data.type || 'generic';
    this.name = data.name || 'Event';
    this.data = data.data || {};
    this.duration = data.duration || 0;
    this.parent = data.parent || null;
    this.children = [];
    this.tags = new Set(data.tags || []);
    this.metadata = data.metadata || {};
  }

  /**
   * Calculate end time for events with duration
   */
  get endTime() {
    return this.timestamp + this.duration;
  }

  /**
   * Check if this event overlaps with another
   */
  overlaps(other) {
    return this.timestamp < other.endTime && this.endTime > other.timestamp;
  }

  /**
   * Add a child event
   */
  addChild(event) {
    this.children.push(event);
    event.parent = this.id;
    return this;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      name: this.name,
      data: this.data,
      duration: this.duration,
      parent: this.parent,
      tags: Array.from(this.tags),
      metadata: this.metadata
    };
  }
}

// Timeline data structure
export class Timeline {
  constructor(options = {}) {
    this.events = new Map();
    this.startTime = options.startTime || performance.now();
    this.name = options.name || 'Timeline';
    this.maxEvents = options.maxEvents || 10000;
    this.eventTypes = new Set();
    this.listeners = new Map();
  }

  /**
   * Add an event to the timeline
   */
  addEvent(eventData) {
    const event = eventData instanceof TimelineEvent ? eventData : new TimelineEvent(eventData);

    // Enforce max events limit
    if (this.events.size >= this.maxEvents) {
      const oldestEvent = Array.from(this.events.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      this.events.delete(oldestEvent.id);
    }

    this.events.set(event.id, event);
    this.eventTypes.add(event.type);
    this.emit('event:added', event);

    return event;
  }

  /**
   * Get events within a time range
   */
  getEventsInRange(startTime, endTime) {
    return Array.from(this.events.values())
      .filter(event => {
        const eventEnd = event.endTime;
        return event.timestamp <= endTime && eventEnd >= startTime;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get events by type
   */
  getEventsByType(type) {
    return Array.from(this.events.values())
      .filter(event => event.type === type)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get timeline statistics
   */
  getStats() {
    const events = Array.from(this.events.values());
    if (events.length === 0) return null;

    const timestamps = events.map(e => e.timestamp);
    const durations = events.filter(e => e.duration > 0).map(e => e.duration);

    return {
      eventCount: events.length,
      timeRange: {
        start: Math.min(...timestamps),
        end: Math.max(...events.map(e => e.endTime))
      },
      eventTypes: Array.from(this.eventTypes),
      averageDuration: durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
      totalDuration: this.getTotalDuration()
    };
  }

  /**
   * Get total timeline duration
   */
  getTotalDuration() {
    const events = Array.from(this.events.values());
    if (events.length === 0) return 0;

    const minTime = Math.min(...events.map(e => e.timestamp));
    const maxTime = Math.max(...events.map(e => e.endTime));

    return maxTime - minTime;
  }

  /**
   * Clear all events
   */
  clear() {
    this.events.clear();
    this.eventTypes.clear();
    this.emit('timeline:cleared');
  }

  /**
   * Simple event emitter functionality
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    return this;
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Export timeline data
   */
  export() {
    return {
      name: this.name,
      startTime: this.startTime,
      events: Array.from(this.events.values()).map(e => e.toJSON())
    };
  }

  /**
   * Import timeline data
   */
  import(data) {
    this.clear();
    this.name = data.name || this.name;
    this.startTime = data.startTime || this.startTime;

    data.events.forEach(eventData => {
      this.addEvent(new TimelineEvent(eventData));
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
    this.timeline = new Timeline({ name: 'Performance' });
  }

  /**
   * Mark a point in time
   */
  mark(name, metadata = {}) {
    const timestamp = performance.now();
    this.marks.set(name, { timestamp, metadata });

    this.timeline.addEvent({
      type: 'mark',
      name,
      timestamp,
      data: metadata
    });

    return timestamp;
  }

  /**
   * Measure between two marks or from a mark to now
   */
  measure(name, startMark, endMark = null) {
    const start = this.marks.get(startMark);
    if (!start) throw new Error(`Start mark "${startMark}" not found`);

    const endTime = endMark
      ? (this.marks.get(endMark)?.timestamp || performance.now())
      : performance.now();

    const duration = endTime - start.timestamp;

    this.measures.set(name, {
      start: start.timestamp,
      end: endTime,
      duration,
      startMark,
      endMark
    });

    this.timeline.addEvent({
      type: 'measure',
      name,
      timestamp: start.timestamp,
      duration,
      data: { startMark, endMark }
    });

    return duration;
  }

  /**
   * Start a timer (returns a function to stop it)
   */
  startTimer(name, metadata = {}) {
    const startTime = this.mark(`${name}:start`, metadata);

    return () => {
      this.mark(`${name}:end`, metadata);
      return this.measure(name, `${name}:start`, `${name}:end`);
    };
  }

  /**
   * Get all measures
   */
  getMeasures() {
    return Array.from(this.measures.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
    this.timeline.clear();
  }
}

// Event aggregation and analysis
export class TimelineAnalyzer {
  /**
   * Group events by a specific property
   */
  static groupBy(events, property) {
    return events.reduce((groups, event) => {
      const key = property === 'type' ? event.type : event.data[property];
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    }, {});
  }

  /**
   * Calculate event frequency over time
   */
  static calculateFrequency(events, bucketSize = 1000) {
    if (events.length === 0) return [];

    const minTime = Math.min(...events.map(e => e.timestamp));
    const maxTime = Math.max(...events.map(e => e.timestamp));
    const buckets = [];

    for (let time = minTime; time <= maxTime; time += bucketSize) {
      const count = events.filter(e =>
        e.timestamp >= time && e.timestamp < time + bucketSize
      ).length;

      buckets.push({
        time,
        count,
        rate: count / (bucketSize / 1000) // events per second
      });
    }

    return buckets;
  }

  /**
   * Find event patterns
   */
  static findPatterns(events, options = {}) {
    const { minSupport = 2, maxGap = 1000 } = options;
    const patterns = new Map();

    // Simple sequential pattern detection
    for (let i = 0; i < events.length - 1; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const gap = events[j].timestamp - events[i].timestamp;
        if (gap > maxGap) break;

        const pattern = `${events[i].type}->${events[j].type}`;
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }

    // Filter by minimum support
    return Array.from(patterns.entries())
      .filter(([_, count]) => count >= minSupport)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate timeline metrics
   */
  static calculateMetrics(events) {
    const durations = events
      .filter(e => e.duration > 0)
      .map(e => e.duration)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return { count: events.length };
    }

    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;

    // Calculate percentiles
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];

    return {
      count: events.length,
      sum,
      avg,
      min: durations[0],
      max: durations[durations.length - 1],
      p50,
      p95,
      p99
    };
  }
}

// Visualization helpers
export class TimelineVisualizer {
  /**
   * Generate swimlane data for visualization
   */
  static generateSwimlanes(events) {
    const lanes = new Map();

    events.forEach(event => {
      const laneKey = event.type;
      if (!lanes.has(laneKey)) {
        lanes.set(laneKey, []);
      }
      lanes.get(laneKey).push(event);
    });

    return Array.from(lanes.entries()).map(([name, events]) => ({
      name,
      events: events.sort((a, b) => a.timestamp - b.timestamp)
    }));
  }

  /**
   * Generate flame graph data
   */
  static generateFlameGraph(events) {
    const root = { name: 'root', value: 0, children: [] };
    const stack = [root];

    events
      .filter(e => e.duration > 0)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(event => {
        // Pop stack until we find where this event fits
        while (stack.length > 1) {
          const parent = stack[stack.length - 1];
          if (parent.timestamp + parent.duration > event.timestamp) {
            break;
          }
          stack.pop();
        }

        const node = {
          name: event.name,
          value: event.duration,
          timestamp: event.timestamp,
          duration: event.duration,
          children: []
        };

        stack[stack.length - 1].children.push(node);
        stack.push(node);
      });

    return root;
  }

  /**
   * Generate histogram bins
   */
  static generateHistogram(values, binCount = 20) {
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => ({
      start: min + i * binSize,
      end: min + (i + 1) * binSize,
      count: 0
    }));

    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        binCount - 1
      );
      bins[binIndex].count++;
    });

    return bins;
  }
}

// Event logger with batching and filtering
export class EventLogger {
  constructor(options = {}) {
    this.timeline = options.timeline || new Timeline();
    this.batchSize = options.batchSize || 100;
    this.batchTimeout = options.batchTimeout || 100;
    this.filters = new Set();
    this.batch = [];
    this.batchTimer = null;
    this.enabled = true;
  }

  /**
   * Log an event
   */
  log(type, name, data = {}) {
    if (!this.enabled || this.filters.has(type)) return;

    const event = {
      type,
      name,
      data,
      timestamp: performance.now()
    };

    this.batch.push(event);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchTimeout);
    }

    return event;
  }

  /**
   * Log an event with duration
   */
  logTimed(type, name, fn, data = {}) {
    const start = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - start;

      this.log(type, name, {
        ...data,
        duration,
        success: true
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.log(type, name, {
        ...data,
        duration,
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Create a scoped logger
   */
  scope(prefix) {
    const scopedLogger = Object.create(this);
    const originalLog = this.log.bind(this);

    scopedLogger.log = (type, name, data) => {
      return originalLog(type, `${prefix}:${name}`, data);
    };

    return scopedLogger;
  }

  /**
   * Add a filter
   */
  addFilter(type) {
    this.filters.add(type);
    return this;
  }

  /**
   * Remove a filter
   */
  removeFilter(type) {
    this.filters.delete(type);
    return this;
  }

  /**
   * Flush batched events
   */
  flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.batch.forEach(event => {
      this.timeline.addEvent(event);
    });

    this.batch = [];
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.flush();
    return this;
  }
}

// Utility functions
export const TimelineUtils = {
  /**
   * Merge multiple timelines
   */
  merge(...timelines) {
    const merged = new Timeline();

    timelines.forEach(timeline => {
      Array.from(timeline.events.values()).forEach(event => {
        merged.addEvent(event);
      });
    });

    return merged;
  },

  /**
   * Filter timeline events
   */
  filter(timeline, predicate) {
    const filtered = new Timeline({ name: `${timeline.name} (filtered)` });

    Array.from(timeline.events.values())
      .filter(predicate)
      .forEach(event => filtered.addEvent(event));

    return filtered;
  },

  /**
   * Create a timeline snapshot
   */
  snapshot(timeline) {
    return {
      timestamp: performance.now(),
      stats: timeline.getStats(),
      eventCount: timeline.events.size,
      data: timeline.export()
    };
  },

  /**
   * Diff two timeline snapshots
   */
  diff(snapshot1, snapshot2) {
    return {
      timeDiff: snapshot2.timestamp - snapshot1.timestamp,
      eventsDiff: snapshot2.eventCount - snapshot1.eventCount,
      newEvents: snapshot2.data.events.filter(e2 =>
        !snapshot1.data.events.some(e1 => e1.id === e2.id)
      )
    };
  }
};

// Export all classes and utilities
export default {
  TimeFormat,
  TimelineEvent,
  Timeline,
  PerformanceMonitor,
  TimelineAnalyzer,
  TimelineVisualizer,
  EventLogger,
  TimelineUtils
};
