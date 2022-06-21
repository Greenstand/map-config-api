const BaseRepository = require('./BaseRepository');

class MapConfigRepository extends BaseRepository {
  constructor(session) {
    super('map_config', session);
    this._tableName = 'map_config';
    this._session = session;
  }

  async create(object) {
    return this._session
      .getDB()(this._tableName)
      .insert(object)
      .onConflict('organization_id')
      .merge({
        theme: object.theme,
        updated_at: new Date().toISOString(),
      });
  }
}

module.exports = MapConfigRepository;
