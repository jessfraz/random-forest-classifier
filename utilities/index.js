var _ = require("underscore");

var Gain = function(data, feature, y){
    var attribute_values = _.pluck(data, feature),
        entropy = Entropy(_.pluck(data, y)),
        size = data.length,
        feature_type = GetType(data[0][feature]);

    if (feature_type == "float" || feature_type == "int"){
        var entropies = attribute_values.map(function(n){
            var cutf = parseFloat(n),
                _gain = entropy - ConditionalEntropy(data, feature, y, cutf);
            return {
                feature: feature,
                gain: _gain,
                cut: cutf
            };
        });
        return _.max(entropies, function(e){return e.gain});
    } else {
        var entropies = attribute_values.map(function(n){
            var subset = data.filter(function(x){return x[feature] === n});
            return ((subset.length/size) * Entropy(_.pluck(subset, y)));
        });

        var total_entropies =  entropies.reduce(function(a, b){ return a+b; }, 0);
        return {
            feature: feature,
            gain: entropy - total_entropies,
            cut: 0
        };
    }
};

var MaxGain = function(data, features, y){
  var gains = [];
  for(var i=0; i < features.length; i++) {
    gains.push(Gain(data, features[i], y));
  }
  return _.max(gains,function(e){
    return e.gain;
  });
};

var GetDominate = function(vals){
    return  _.sortBy(vals, function(a){
            return Count(a, vals);
        }).reverse()[0];
};

var Count = function (a, vals){
    return _.filter(vals, function(b) { return b === a}).length;
};

var Entropy = function(vals){
    var unique = _.unique(vals),
        probs = unique.map(function(x){ return Probability(x, vals); }),
        logs = probs.map(function(p){ return -p*Log2(p); });

    return logs.reduce(function(a, b){ return a+b; }, 0);
};

var ConditionalEntropy = function(_s, feature, y, cut){
    var s_1 = _s.filter(function(x){return x[feature] <= cut}),
        s_2 = _s.filter(function(x){return x[feature] > cut}),
        size = _s.length;
    return s_1.length/size*Entropy(_.pluck(s_1, y)) + s_2.length/size*Entropy(_.pluck(s_1, y));
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
};

var GetType = function(input) {
    var m = (/[\d]+(\.[\d]+)?/).exec(input);
    if (m) {
       // Check if there is a decimal place
        if (m[1]) {
            return 'float';
        } else {
            return 'int';
        }
    }
    return 'string';
};

var Average = function(v){
    var sum = v.reduce(function(a, b) { return a + b });
    var avg = sum / v.length;
    return avg;
}


var C45 = function(data, features, y){
    var tree = {};
    var y_values = _.pluck(data, y);

    // last leaf
    if (y_values.length == 1) {
        return {
            type:"result",
            val: y_values[0],
            name: y_values[0],
            alias: y_values[0] + RID()
        };
    }

    if (features === true || y_values.length == 0){
        // end of branch
        // returning the most dominate feature
        var dominate_y = GetDominate(y_values);
        return {
            type:"result",
            val: dominate_y,
            name: dominate_y,
            alias: dominate_y + RID()
        };
    }

    if (!features || features.length == 0){
        // get all the features that are not y
        features = _.reject(_.keys(data[0]), function(f){ return f == y; });
    }

    var best_feature_data = MaxGain(data, features, y),
        best_feature = best_feature_data.feature;
    var feature_remains = _.without(features, best_feature);
    var best_feature_type = GetType(data[0][best_feature]);

    // check if its an int/float
    if (best_feature_type == "float" || best_feature_type == "int"){
        tree = {
            name: best_feature,
            alias: best_feature + RID(),
            cut: best_feature_data.cut,
            type: "feature_real",
            children: []
        };

        if (feature_remains.length == 0){
            feature_remains = true;
        }

        var rightCutData = data.filter(function(x){ return x[best_feature] > best_feature_data.cut});
        var child_node_r = {
            name: tree.cut.toString(),
            alias: '>' + tree.cut.toString() + RID(),
            type: "feature_value"
        };
        child_node_r.child = C45(rightCutData, feature_remains, y);
        tree.children.push(child_node_r);

        var leftCutData = data.filter(function(x){return x[best_feature] <= best_feature_data.cut});
        var child_node_l = {
            name: tree.cut.toString(),
            alias: '<=' + tree.cut.toString() + RID(),
            type: "feature_value"
        };
        child_node_l.child = C45(leftCutData, feature_remains, y);
        tree.children.push(child_node_l);
    } else {
        var possibilities = possibilities = _.unique(_.pluck(data, best_feature));
        tree = {
            name: best_feature,
            alias: best_feature + RID(),
            type: "feature",
            children: []
        };

        tree.children = _.map(possibilities, function(v){
            var data_modified = data.filter(function(x) { return x[best_feature] == v; });

            var branch = {
                name: v,
                alias: v + RID(),
                type: "feature_value"
            };

            if (feature_remains.length == 0){
                feature_remains = true;
            }
            branch.child = C45(data_modified, feature_remains, y);

            return branch;
        });
    }

    return tree;
};

var ID3 = function(data, features, y){
    var y_values = _.unique(_.pluck(data, y));

    // last leaf
    if (y_values.length == 1){
        return {
            type: "result",
            val: y_values[0],
            name: y_values[0],
            alias: y_values[0] + RID()
        };
    }

    if (features === true || y_values.length == 0){
        // end of branch
        // returning the most dominate feature
        var dominate_y = GetDominate(_.pluck(data, y));
        return {
            type:"result",
            val: dominate_y,
            name: dominate_y,
            alias: dominate_y + RID()
        };
    }

    if (!features || features.length == 0){
        // get all the features that are not y
        features = _.reject(_.keys(data[0]), function(f){ return f == y; });
    }

    var best_feature = _.max(features, function(f){return Gain(data, f, y).gain; });
    var feature_remains = _.without(features, best_feature);
    var possibilities = _.unique(_.pluck(data, best_feature));
    var tree = {
        name: best_feature,
        alias: best_feature + RID(),
        type: "feature"
    };

    // create the branch of the tree
    tree.children = _.map(possibilities, function(v){
        var data_modified = data.filter(function(x) { return x[best_feature] == v; });

        var branch = {
            name: v,
            alias: v + RID(),
            type: "feature_value"
        };

        if (feature_remains.length == 0){
            feature_remains = true;
        }
        branch.child = ID3(data_modified, feature_remains, y);

        return branch;
    });

    return tree;
}


module.exports.ID3 = ID3;
module.exports.C45 = C45;
module.exports.GetType = GetType;
module.exports.GetDominate = GetDominate;
module.exports.Average = Average;