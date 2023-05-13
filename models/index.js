const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName:'posters',
    mediaProperty() {
        return this.belongsTo('MediaProperty')
    }
});

const MediaProperty = bookshelf.model('MediaProperty',{
    tableName: 'media_properties',
    posters() {
        return this.hasMany('Poster', 'mediaProperty_id');
    }
})

module.exports = { Poster, MediaProperty };