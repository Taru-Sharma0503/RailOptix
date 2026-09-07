const trainRepo = require('../repositories/train.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const stationRepo = require('../repositories/station.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse } = require('../utils/helpers');

function addMinutes(time, minutes) {
  if (!time || time === '—') return '—';

  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;

  return `${String(Math.floor((total % 1440) / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function getStatus(priority) {
  return priority >= 9 ? 'On Time'
    : priority >= 7 ? 'Approaching'
    : priority >= 5 ? 'Delayed'
    : 'At Risk';
}

function getDelay(status) {
  return status === 'On Time' ? 0
    : status === 'Approaching' ? 3
    : status === 'Delayed' ? 8
    : 15;
}

class TrainService {
  async getTrains(filters) {
    const trains = await trainRepo.findWithFilters(filters);

    const result = await Promise.all(trains.map(async (t) => {
      const stations = t.corridorId
        ? await stationRepo.findByCorridorId(t.corridorId)
        : [];

      const status = getStatus(t.priority);
      const delayMinutes = getDelay(status);
      const scheduledArrival = t.arrival || '—';

      return {
        ...t,
        origin: stations[0]?.name || '—',
        destination: stations.at(-1)?.name || '—',
        current: stations[1]?.name || stations[0]?.name || '—',
        next: stations.at(-1)?.name || '—',
        status,
        delay: `${delayMinutes} min`,
        scheduledArrival,
        estimatedArrival: addMinutes(scheduledArrival, delayMinutes),
        operationalImpact:
          status === 'On Time' ? 'No operational impact'
          : status === 'Approaching' ? 'Monitor movement'
          : status === 'Delayed' ? 'Review required'
          : 'Priority intervention',
      };
    }));

    return successResponse({ trains: result });
  }

  async getTrainById(id) {
    const train = await trainRepo.findById(id);
    if (!train) throw NotFoundError.resource('Train');

    const schedule = await trainScheduleRepo.findByTrainId(id);

    const stations = train.corridorId
      ? await stationRepo.findByCorridorId(train.corridorId)
      : [];

    const status = getStatus(train.priority);
    const delayMinutes = getDelay(status);

    const scheduledArrival =
      schedule[0]?.arrival_time || '—';

    const estimatedArrival =
      addMinutes(scheduledArrival, delayMinutes);

    return successResponse({
      train: {
        ...train,

        origin: stations[0]?.name || '—',
        destination: stations.at(-1)?.name || '—',
        current: stations[1]?.name || stations[0]?.name || '—',
        next: stations.at(-1)?.name || '—',

        status,
        delay: `${delayMinutes} min`,

        scheduledArrival,
        estimatedArrival,

        operationalImpact:
          status === 'On Time' ? 'No operational impact'
          : status === 'Approaching' ? 'Monitor movement'
          : status === 'Delayed' ? 'Review required'
          : 'Priority intervention',

        route: stations.map(s => s.id),
        stations,
        schedule,
      },
    });
  }

  async getTimetable(filters) {
    const schedules = await trainScheduleRepo.findWithFilters(filters);

    return successResponse({
      date: filters.date,
      trains: schedules,
    });
  }
}

module.exports = new TrainService();