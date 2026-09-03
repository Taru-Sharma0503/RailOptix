const stationRepo = require('../repositories/station.repository');
const corridorRepo = require('../repositories/corridor.repository');
const assetRepo = require('../repositories/asset.repository');
const blockRepo = require('../repositories/block.repository');
const trainRepo = require('../repositories/train.repository');
const trainScheduleRepo = require('../repositories/trainSchedule.repository');
const { successResponse } = require('../utils/helpers');

class NetworkService {
  async getNetwork(corridorId) {
    const corridors = await corridorRepo.findAll();
    let stations = await stationRepo.findAll();
    let assets = await assetRepo.findWithFilters(corridorId ? { corridorId } : {});
    let activeBlocks = await blockRepo.findWithFilters({ status: 'active' });
    let trains = await trainRepo.findWithFilters(corridorId ? { corridorId } : {});

    if (corridorId) {
      stations = stations.filter((s) => s.corridorId === corridorId);
      activeBlocks = activeBlocks.filter((b) => b.corridorId === corridorId);
      trains = trains.filter((t) => t.corridorId === corridorId);
    }

    return successResponse({
      stations,
      corridors,
      assets,
      activeBlocks,
      trains,
    });
  }

  async getStations(corridorId) {
    const stations = corridorId ? await stationRepo.findByCorridorId(corridorId) : await stationRepo.findAll();
    return successResponse({ stations });
  }

  async getCorridors() {
    const corridors = await corridorRepo.findAll();
    return successResponse({ corridors });
  }
}

module.exports = new NetworkService();
