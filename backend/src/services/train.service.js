const trainRepo = require('../repositories/train.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const stationRepo = require('../repositories/station.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse } = require('../utils/helpers');

class TrainService {
  async getTrains(filters) {
    const trains = await trainRepo.findWithFilters(filters);
    return successResponse({ trains });
  }

  // Matches schema: embeds `route` (station IDs on the train's corridor)
  // and `schedule` (raw schedule rows) on the train object.
  async getTrainById(id) {
    const train = await trainRepo.findById(id);
    if (!train) throw NotFoundError.resource('Train');

    const schedule = await trainScheduleRepo.findByTrainId(id);
    const stations = train.corridorId ? await stationRepo.findByCorridorId(train.corridorId) : [];
    const route = stations.map((s) => s.id);

    return successResponse({
      train: {
        ...train,
        route,
        schedule,
      },
    });
  }

  // Matches schema: response key `trains` (was `timetable`), echoes `date`.
  async getTimetable(filters) {
    const schedules = await trainScheduleRepo.findWithFilters(filters);
    return successResponse({ date: filters.date, trains: schedules });
  }
}

module.exports = new TrainService();