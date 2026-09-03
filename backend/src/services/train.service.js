const trainRepo = require('../repositories/train.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const { NotFoundError } = require('../utils/errors');
const { successResponse } = require('../utils/helpers');

class TrainService {
  async getTrains(filters) {
    const trains = await trainRepo.findWithFilters(filters);
    return successResponse({ trains });
  }

  async getTrainById(id) {
    const train = await trainRepo.findById(id);
    if (!train) throw NotFoundError.resource('Train');
    return successResponse({ train });
  }

  async getTimetable(filters) {
    const schedules = await trainScheduleRepo.findWithFilters(filters);
    return successResponse({ timetable: schedules });
  }
}

module.exports = new TrainService();
