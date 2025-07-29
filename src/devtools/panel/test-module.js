
        // Import the timeline library concepts
        class TimelineEvent {
            constructor(data = {}) {
                this.id = data.id || crypto.randomUUID();
                this.timestamp = data.timestamp || performance.now();
                this.type = data.type || 'generic';
                this.name = data.name || 'Event';
                this.data = data.data || {};
                this.duration = data.duration || 0;
            }

            get endTime() {
                return this.timestamp + this.duration;
            }
        }

        // Global state
        let events = [];
        let startTime = performance.now();

        // Color scheme for event types
        const typeColors = {
            network: '#4a9eff',
            render: '#52c41a',
            script: '#ff7875',
            user: '#faad14',
            system: '#b37feb',
            generic: '#888888'
        };

        // SVG setup
        const svg = document.getElementById('timeline');
        const tooltip = document.getElementById('tooltip');
        const margin = { top: 40, right: 20, bottom: 40, left: 80 };
        const width = 1100 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create main group
        const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mainGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
        svg.appendChild(mainGroup);

        // Create layers
        const gridLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const swimLaneLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const eventLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const axisLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        mainGroup.appendChild(gridLayer);
        mainGroup.appendChild(swimLaneLayer);
        mainGroup.appendChild(eventLayer);
        mainGroup.appendChild(axisLayer);

        function generateRandomEvents() {
            clearTimeline();
            startTime = performance.now();

            const types = ['network', 'render', 'script', 'user', 'system'];
            const baseTime = 0;

            for (let i = 0; i < 30; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const timestamp = baseTime + Math.random() * 5000;
                const duration = type === 'network' ? 100 + Math.random() * 400 :
                               type === 'render' ? 10 + Math.random() * 50 :
                               type === 'script' ? 5 + Math.random() * 100 :
                               Math.random() * 30;

                events.push(new TimelineEvent({
                    type,
                    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Event ${i}`,
                    timestamp,
                    duration,
                    data: {
                        size: Math.floor(Math.random() * 1000) + 'KB',
                        status: Math.random() > 0.1 ? 'success' : 'error'
                    }
                }));
            }

            updateVisualization();
        }

        function generateNetworkEvents() {
            clearTimeline();
            startTime = performance.now();

            // Simulate a page load sequence
            const requests = [
                { name: 'HTML Document', time: 0, duration: 120 },
                { name: 'CSS Bundle', time: 50, duration: 80 },
                { name: 'JavaScript Bundle', time: 60, duration: 150 },
                { name: 'Logo Image', time: 130, duration: 40 },
                { name: 'API: /user', time: 200, duration: 180 },
                { name: 'API: /config', time: 210, duration: 100 },
                { name: 'Font File', time: 140, duration: 60 },
                { name: 'Analytics Script', time: 300, duration: 30 },
                { name: 'API: /data', time: 400, duration: 250 },
                { name: 'Lazy Image 1', time: 600, duration: 80 },
                { name: 'Lazy Image 2', time: 650, duration: 90 },
            ];

            requests.forEach((req, i) => {
                events.push(new TimelineEvent({
                    type: 'network',
                    name: req.name,
                    timestamp: req.time,
                    duration: req.duration,
                    data: {
                        size: Math.floor(Math.random() * 500 + 10) + 'KB',
                        status: 'success'
                    }
                }));

                // Add render events after critical resources
                if (req.name.includes('CSS') || req.name.includes('JavaScript')) {
                    events.push(new TimelineEvent({
                        type: 'render',
                        name: `Parse ${req.name}`,
                        timestamp: req.time + req.duration,
                        duration: 20 + Math.random() * 30,
                        data: { status: 'success' }
                    }));
                }
            });

            // Add paint events
            [300, 450, 700].forEach((time, i) => {
                events.push(new TimelineEvent({
                    type: 'render',
                    name: `Paint ${i + 1}`,
                    timestamp: time,
                    duration: 15,
                    data: { area: '1920x1080' }
                }));
            });

            updateVisualization();
        }

        function generateUserEvents() {
            clearTimeline();
            startTime = performance.now();

            // Simulate user interaction sequence
            const interactions = [
                { type: 'user', name: 'Page Load', time: 0, duration: 0 },
                { type: 'user', name: 'Mouse Move', time: 500, duration: 0 },
                { type: 'user', name: 'Button Hover', time: 800, duration: 0 },
                { type: 'user', name: 'Button Click', time: 1000, duration: 0 },
                { type: 'script', name: 'Event Handler', time: 1001, duration: 25 },
                { type: 'script', name: 'State Update', time: 1026, duration: 10 },
                { type: 'render', name: 'Re-render', time: 1036, duration: 15 },
                { type: 'network', name: 'API: Submit Form', time: 1040, duration: 200 },
                { type: 'user', name: 'Input Focus', time: 1500, duration: 0 },
                { type: 'user', name: 'Typing', time: 1600, duration: 0 },
                { type: 'script', name: 'Validation', time: 1601, duration: 5 },
                { type: 'user', name: 'Scroll', time: 2000, duration: 0 },
                { type: 'script', name: 'Lazy Load Check', time: 2001, duration: 8 },
                { type: 'network', name: 'Load More Content', time: 2010, duration: 150 },
                { type: 'render', name: 'Render New Items', time: 2160, duration: 20 },
            ];

            interactions.forEach(int => {
                events.push(new TimelineEvent({
                    type: int.type,
                    name: int.name,
                    timestamp: int.time,
                    duration: int.duration,
                    data: { triggered: int.type === 'user' }
                }));
            });

            updateVisualization();
        }

        function clearTimeline() {
            events = [];
            eventLayer.innerHTML = '';
            updateStats();
        }

        function updateVisualization() {
            const viewMode = document.getElementById('viewMode').value;
            const timeScale = parseFloat(document.getElementById('timeScale').value);

            eventLayer.innerHTML = '';
            gridLayer.innerHTML = '';
            swimLaneLayer.innerHTML = '';
            axisLayer.innerHTML = '';

            if (events.length === 0) return;

            // Calculate time range
            const minTime = Math.min(...events.map(e => e.timestamp));
            const maxTime = Math.max(...events.map(e => e.endTime));
            const duration = maxTime - minTime;

            // Create scale
            const xScale = (time) => ((time - minTime) / duration) * width * timeScale;

            // Draw grid and time ruler
            drawTimeRuler(minTime, maxTime, xScale);

            // Draw events based on view mode
            switch (viewMode) {
                case 'swimlane':
                    drawSwimLaneView(xScale);
                    break;
                case 'compact':
                    drawCompactView(xScale);
                    break;
                case 'duration':
                    drawDurationView(xScale);
                    break;
            }

            updateStats();
        }

        function drawTimeRuler(minTime, maxTime, xScale) {
            const duration = maxTime - minTime;
            const tickCount = 10;
            const tickInterval = duration / tickCount;

            for (let i = 0; i <= tickCount; i++) {
                const time = minTime + i * tickInterval;
                const x = xScale(time);

                // Grid line
                const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                gridLine.setAttribute('x1', x);
                gridLine.setAttribute('y1', 0);
                gridLine.setAttribute('x2', x);
                gridLine.setAttribute('y2', height);
                gridLine.setAttribute('class', 'grid-line');
                gridLayer.appendChild(gridLine);

                // Time label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x);
                label.setAttribute('y', height + 20);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('class', 'time-ruler');
                label.textContent = `${Math.round(time)}ms`;
                axisLayer.appendChild(label);
            }
        }

        function drawSwimLaneView(xScale) {
            // Group events by type
            const typeGroups = {};
            events.forEach(event => {
                if (!typeGroups[event.type]) {
                    typeGroups[event.type] = [];
                }
                typeGroups[event.type].push(event);
            });

            const types = Object.keys(typeGroups);
            const laneHeight = height / types.length;

            types.forEach((type, laneIndex) => {
                const y = laneIndex * laneHeight;

                // Draw swim lane background
                const lane = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                lane.setAttribute('x', 0);
                lane.setAttribute('y', y);
                lane.setAttribute('width', width);
                lane.setAttribute('height', laneHeight);
                lane.setAttribute('class', 'swim-lane');
                swimLaneLayer.appendChild(lane);

                // Lane label
                const laneLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                laneLabel.setAttribute('x', -10);
                laneLabel.setAttribute('y', y + laneHeight / 2);
                laneLabel.setAttribute('text-anchor', 'end');
                laneLabel.setAttribute('class', 'event-label');
                laneLabel.setAttribute('alignment-baseline', 'middle');
                laneLabel.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                axisLayer.appendChild(laneLabel);

                // Draw events in lane
                const laneEvents = typeGroups[type].sort((a, b) => a.timestamp - b.timestamp);
                let lanes = [];

                laneEvents.forEach(event => {
                    // Find available lane
                    let laneNum = 0;
                    for (let i = 0; i < lanes.length; i++) {
                        if (lanes[i] <= event.timestamp) {
                            laneNum = i;
                            break;
                        }
                    }
                    if (laneNum === lanes.length) {
                        lanes.push(0);
                    }
                    lanes[laneNum] = event.endTime;

                    const eventHeight = Math.min(30, laneHeight / (lanes.length + 1));
                    const eventY = y + 5 + laneNum * (eventHeight + 2);

                    drawEvent(event, xScale, eventY, eventHeight);
                });
            });
        }

        function drawCompactView(xScale) {
            // Stack events to minimize vertical space
            const lanes = [];

            events.sort((a, b) => a.timestamp - b.timestamp).forEach(event => {
                // Find first available lane
                let laneIndex = lanes.findIndex(lane => lane <= event.timestamp);
                if (laneIndex === -1) {
                    laneIndex = lanes.length;
                    lanes.push(0);
                }
                lanes[laneIndex] = event.endTime;

                const y = 10 + laneIndex * 35;
                drawEvent(event, xScale, y, 25);
            });
        }

        function drawDurationView(xScale) {
            // Focus on events with duration, show them larger
            const durationEvents = events.filter(e => e.duration > 0)
                                       .sort((a, b) => b.duration - a.duration);

            durationEvents.forEach((event, index) => {
                const y = 10 + index * 35;
                const height = 25;

                drawEvent(event, xScale, y, height);

                // Draw duration line
                const durationLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                durationLine.setAttribute('x1', xScale(event.timestamp));
                durationLine.setAttribute('y1', y + height / 2);
                durationLine.setAttribute('x2', xScale(event.endTime));
                durationLine.setAttribute('y2', y + height / 2);
                durationLine.setAttribute('class', 'duration-line');
                eventLayer.appendChild(durationLine);
            });
        }

        function drawEvent(event, xScale, y, height) {
            const x = xScale(event.timestamp);
            const width = event.duration > 0 ? Math.max(3, xScale(event.endTime) - x) : 3;

            // Event rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', typeColors[event.type] || typeColors.generic);
            rect.setAttribute('class', 'event-rect');
            rect.setAttribute('rx', 2);

            // Add event data for tooltip
            rect.addEventListener('mouseenter', (e) => showTooltip(e, event));
            rect.addEventListener('mouseleave', hideTooltip);

            eventLayer.appendChild(rect);

            // Event label (if there's space)
            if (width > 50) {
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x + 3);
                label.setAttribute('y', y + height / 2);
                label.setAttribute('class', 'event-label');
                label.setAttribute('alignment-baseline', 'middle');
                label.textContent = event.name.length > 20 ?
                    event.name.substring(0, 17) + '...' : event.name;
                eventLayer.appendChild(label);
            }
        }

        function showTooltip(e, event) {
            const content = `
                <strong>${event.name}</strong><br>
                Type: ${event.type}<br>
                Start: ${event.timestamp.toFixed(2)}ms<br>
                Duration: ${event.duration.toFixed(2)}ms<br>
                ${event.data.size ? `Size: ${event.data.size}<br>` : ''}
                ${event.data.status ? `Status: ${event.data.status}` : ''}
            `;

            tooltip.innerHTML = content;
            tooltip.style.display = 'block';

            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        }

        function hideTooltip() {
            tooltip.style.display = 'none';
        }

        function updateStats() {
            const statsDiv = document.getElementById('statsContent');

            if (events.length === 0) {
                statsDiv.textContent = 'No events yet';
                return;
            }

            const typeCount = {};
            let totalDuration = 0;
            let eventsWithDuration = 0;

            events.forEach(event => {
                typeCount[event.type] = (typeCount[event.type] || 0) + 1;
                if (event.duration > 0) {
                    totalDuration += event.duration;
                    eventsWithDuration++;
                }
            });

            const minTime = Math.min(...events.map(e => e.timestamp));
            const maxTime = Math.max(...events.map(e => e.endTime));

            const statsHTML = `
                <strong>Total Events:</strong> ${events.length}<br>
                <strong>Time Range:</strong> ${(maxTime - minTime).toFixed(2)}ms<br>
                <strong>Average Duration:</strong> ${eventsWithDuration > 0 ?
                    (totalDuration / eventsWithDuration).toFixed(2) : 0}ms<br>
                <strong>Event Types:</strong> ${Object.entries(typeCount)
                    .map(([type, count]) => `${type} (${count})`)
                    .join(', ')}
            `;

            statsDiv.innerHTML = statsHTML;
        }

        // Set up event listeners
        document.getElementById('btnRandom').addEventListener('click', generateRandomEvents);
        document.getElementById('btnNetwork').addEventListener('click', generateNetworkEvents);
        document.getElementById('btnUser').addEventListener('click', generateUserEvents);
        document.getElementById('btnClear').addEventListener('click', clearTimeline);
        document.getElementById('viewMode').addEventListener('change', updateVisualization);
        document.getElementById('timeScale').addEventListener('change', updateVisualization);

        // Initialize with random events
        generateRandomEvents();
