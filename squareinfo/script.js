document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    fetch('basic.ics')
        .then(response => {
            console.log('Fetching .ics file');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Parsing .ics file');
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');
            console.log('Events found:', vevents.length);
            displayWeekEvents(vevents);
        })
        .catch(error => console.error('Error fetching .ics file:', error));
});

function displayWeekEvents(events) {
    const timeColumn = document.getElementById('time-column');
    const weekColumn = document.getElementById('week-column');
    timeColumn.innerHTML = '';
    weekColumn.innerHTML = '';

    // Create time slots from 6AM to 11:59PM
    for (let hour = 6; hour <= 23; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.textContent = `${hour}:00`;
        timeColumn.appendChild(timeSlot);
    }

    // Add hour lines
    for (let hour = 6; hour <= 23; hour++) {
        const hourLine = document.createElement('div');
        hourLine.className = 'hour-line';
        hourLine.style.top = `${(hour - 6) * 40}px`;
        weekColumn.appendChild(hourLine);
    }

    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
    const endOfWeek = new Date(now.setDate(now.getDate() + 6)); // End of the week (Saturday)

    const weekEvents = events.filter(event => {
        const start = event.getFirstPropertyValue('dtstart').toJSDate();
        return start >= startOfWeek && start <= endOfWeek;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysOfWeek.forEach((day, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        const dayHeader = document.createElement('h2');
        dayHeader.textContent = day;
        dayDiv.appendChild(dayHeader);

        const dayEvents = weekEvents.filter(event => {
            const start = event.getFirstPropertyValue('dtstart').toJSDate();
            return start.getDay() === index;
        });

        const sortedEvents = dayEvents.sort((a, b) => {
            const aStart = a.getFirstPropertyValue('dtstart').toJSDate();
            const bStart = b.getFirstPropertyValue('dtstart').toJSDate();
            return aStart - bStart;
        });

        const columns = [];
        sortedEvents.forEach((event, i) => {
            const summary = event.getFirstPropertyValue('summary');
            const location = event.getFirstPropertyValue('location');
            const start = event.getFirstPropertyValue('dtstart').toJSDate();
            const end = event.getFirstPropertyValue('dtend').toJSDate();

            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';

            const top = ((start.getHours() - 6) * 60 + start.getMinutes()) / 60 * 40;
            const height = ((end - start) / (1000 * 60 * 60)) * 40;
            eventDiv.style.top = `${top}px`;
            eventDiv.style.height = `${height}px`;

            let colIndex = 0;
            while (columns[colIndex] && columns[colIndex].some(e => {
                const eStart = e.getFirstPropertyValue('dtstart').toJSDate();
                const eEnd = e.getFirstPropertyValue('dtend').toJSDate();
                return start < eEnd && eStart < end;
            })) {
                colIndex++;
            }

            if (!columns[colIndex]) {
                columns[colIndex] = [];
            }
            columns[colIndex].push(event);

            const colCount = columns.length;
            eventDiv.style.width = `calc(${100 / colCount}% - 10px)`;
            eventDiv.style.left = `calc(${(colIndex * 100) / colCount}% + 5px)`;

            const title = document.createElement('h3');
            title.textContent = summary;
            eventDiv.appendChild(title);

            const loc = document.createElement('p');
            loc.textContent = `Location: ${location}`;
            eventDiv.appendChild(loc);

            const time = document.createElement('p');
            time.textContent = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;
            eventDiv.appendChild(time);

            dayDiv.appendChild(eventDiv);
        });

        weekColumn.appendChild(dayDiv);
    });
}
