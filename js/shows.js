(function () {
  var MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function parseShows(text) {
    var shows = [];
    text.split(/\r?\n/).forEach(function (line) {
      var m = line.trim().match(/^([A-Za-z]+)\.?\s+(\d{1,2}),\s*(\d{4})\s+-\s+(.+)$/);
      if (!m) return;
      var month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
      if (month < 0) return;
      var parts = m[4].replace(/\s+[—–]\s+/g, ' - ').split(/\s+-\s+/);
      shows.push({
        date: new Date(+m[3], month, +m[2]),
        venue: parts[0],
        location: parts[1] || '',
        time: parts.slice(2).join(' - ')
      });
    });
    return shows;
  }

  function row(show, isPast) {
    var d = show.date;
    var el = document.createElement('div');
    el.className = 'date-row' + (isPast ? ' date-row--past' : '');

    var date = document.createElement('span');
    date.className = 'date';
    var dayName = document.createElement('span');
    dayName.className = 'date__day';
    dayName.textContent = DAY_NAMES[d.getDay()];
    var dayFull = document.createElement('span');
    dayFull.className = 'date__full';
    dayFull.textContent = MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    date.appendChild(dayName);
    date.appendChild(dayFull);

    var venue = document.createElement('span');
    venue.className = 'venue';
    venue.textContent = [show.venue, show.location, show.time].filter(Boolean).join(' · ');

    el.appendChild(date);
    el.appendChild(venue);
    return el;
  }

  function render(container, shows, isPast) {
    container.textContent = '';
    shows.forEach(function (s) { container.appendChild(row(s, isPast)); });
  }

  var upcomingEl = document.getElementById('upcoming-shows');
  var pastSection = document.getElementById('past-shows-section');
  var pastEl = document.getElementById('past-shows');
  if (!upcomingEl) return;

  fetch('/shows.txt')
    .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
    .then(function (text) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var shows = parseShows(text);
      var upcoming = shows.filter(function (s) { return s.date >= today; })
        .sort(function (a, b) { return a.date - b.date; });
      var past = shows.filter(function (s) { return s.date < today; })
        .sort(function (a, b) { return b.date - a.date; });

      if (upcoming.length) render(upcomingEl, upcoming, false);
      if (past.length && pastEl && pastSection) {
        render(pastEl, past, true);
        pastSection.hidden = false;
      }
    })
    .catch(function () {});
})();
