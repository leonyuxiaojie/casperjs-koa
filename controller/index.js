module.exports = {
    index: function*(){
        yield this.render('index',{"title":"demo", "nick":""});
    }
}