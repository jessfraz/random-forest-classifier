var _ = require("underscore");

var Gain = function(data, feature, y){
    var attribute_values = _.unique(_.pluck(data, feature)),
        entropy = Entropy(_.pluck(data, y)),
        size = _.size(data);

    var entropies = attribute_values.map(function(n){
        var subset = data.filter(function(x){return x[feature] === n});
        return ((subset.length/size) * Entropy(_.pluck(subset, y)));
    });

    var total_entropies =  entropies.reduce(function(a, b){ return a+b; }, 0);
    return entropy - total_entropies;
};

var GetDominate = function(vals){
    var v = _.sortBy(vals, function(a){
        return _.filter(vals, function(b) {
            return b === a;
        }).length;
    }).reverse()[0];
    return v;
}

var Entropy = function(vals){
    var unique = _.unique(vals),
        probs = unique.map(function(x){ return Probability(x, vals); }),
        logs = probs.map(function(p){ return -p*Log2(p); });

    return logs.reduce(function(a, b){ return a+b; }, 0);
};

var Log2 = function(n){
    return Math.log(n)/Math.log(2);
};

var Probability = function(val, vals){
    var instances = _.filter(vals, function(x) { return x === val; }).length;
    return instances/vals.length;
};

var RID = function(){
    return "_r" + Math.round(Math.random()*1000000).toString();
}

module.exports.Gain = Gain;
module.exports.GetDominate = GetDominate;
module.exports.Entropy = Entropy;
module.exports.Log2 = Log2;
module.exports.Probability = Probability;
module.exports.RID = RID;