/**
 * Created by mdemo on 14-4-10.
 */
var koa = require('koa');
var middlewares = require('koa-middlewares');
var monk = require('monk');
var db = monk('localhost/woxiangqudb');
var wrap = require('co-monk');
var companies = wrap(db.get('companies'));
var app = koa();

//init koa-middlewares

app.use(middlewares.bodyparser());
app.use(middlewares.jsonp());
app.use(middlewares.router(app));
app.use(middlewares.compress());
app.use(middlewares.csrf());

app.get('/',list);
app.get('/company/:name', search);

function *list (){
    var result = yield companies.find({});
    if (!result) {
        this.throw(404, '404');
    }
    this.body = result;
}
//handle error
function error(err,that){
    that.status = err.status || 500;
    that.type = 'html';
    that.body = '<p>Something <em>exploded</em>, please contact mdemo.</p>';

    // since we handled this manually we'll
    // want to delegate to the regular app
    // level error handling as well so that
    // centralized still functions correctly.
    that.app.emit('error', err, that);
}
function *search (){
    try{
        var name = this.params.name;
        var result = yield companies.find({name:name});
        if(!result){
            this.throw(404, '404');
        }
        this.body = result;
    }
    catch (err){
        error(err,this);
    }
}
//print log
app.on('error', function(err){
    if (process.env.NODE_ENV != 'test') {
        console.log('sent error %s to the cloud', err.message);
        console.log(err);
    }
});

app.listen(3000);
console.log('listening on port 3000');