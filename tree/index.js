/*A decision tree classifier.

   Parameters
   ----------
   criterion : string, optional (default="entropy")
       The function to measure the quality of a split. Supported criteria are
       "gini" for the Gini impurity and "entropy" for the information gain.

   splitter : string, optional (default="best")
       The strategy used to choose the split at each node. Supported
       strategies are "best" to choose the best split and "random" to choose
       the best random split.

   max_features : int, float, string or None, optional (default=None)
       The number of features to consider when looking for the best split:
         - If int, then consider `max_features` features at each split.
         - If float, then `max_features` is a percentage and
           `int(max_features * n_features)` features are considered at each
           split.
         - If "auto", then `max_features=sqrt(n_features)`.
         - If "sqrt", then `max_features=sqrt(n_features)`.
         - If "log2", then `max_features=log2(n_features)`.
         - If None, then `max_features=n_features`.

       Note: the search for a split does not stop until at least one
       valid partition of the node samples is found, even if it requires to
       effectively inspect more than ``max_features`` features.

   max_depth : int or None, optional (default=None)
       The maximum depth of the tree. If None, then nodes are expanded until
       all leaves are pure or until all leaves contain less than
       min_samples_split samples.
       Ignored if ``max_samples_leaf`` is not None.

   min_samples_split : int, optional (default=2)
       The minimum number of samples required to split an internal node.

   min_samples_leaf : int, optional (default=1)
       The minimum number of samples required to be at a leaf node.

   max_leaf_nodes : int or None, optional (default=None)
       Grow a tree with ``max_leaf_nodes`` in best-first fashion.
       Best nodes are defined as relative reduction in impurity.
       If None then unlimited number of leaf nodes.
       If not None then ``max_depth`` will be ignored.
*/

var _ = require("underscore"),
    utils = require("../utilities");

var DecisionTreeClassifier = function(params) {
    this.criterion = params.criterion || 'entropy';
    this.splitter = params.splitter || 'best';
    this.min_samples_split = params.min_samples_split || 2;
    this.min_samples_leaf = params.min_samples_leaf || 1;
};

DecisionTreeClassifier.prototype = {
    fit: function(data, features, y) {
        var unique_y_values = _.unique(_.pluck(data, y));

        // last leaf
        if (unique_y_values.length == 1){
            return {
                type: "result",
                val: unique_y_values[0],
                name: unique_y_values[0],
                alias: unique_y_values[0] + utils.RID()
            };
        }

        if (features === true){
            // end of branch
            // returning the most dominate feature
            var dominate_y = utils.GetDominate(unique_y_values);
            return {
                type:"result",
                val: dominate_y,
                name: dominate_y,
                alias: dominate_y + utils.RID()
            };
        }

        if (!features || features.length == 0){
            // get all the features that are not y
            features = _.reject(_.keys(data), function(f){ return f == y; });
        }

        var best_feature = _.max(features, function(f){return utils.Gain(data, f, y); });

        var feature_remains = _.without(features, best_feature);

        var possibilities = _.unique(_.pluck(data, best_feature));

        var tree = {
            name: best_feature,
            alias: best_feature + utils.RID(),
            type: "feature"
        };

        // create the branch of the tree
        tree.vals = _.map(possibilities, function(v){
            var data_modified = data.filter(function(x) { return x[best_feature] == v; });

            var branch = {
                name: v,
                alias: v + utils.RID(),
                type: "feature_value"
            };

            // recursive create children
            var child = new DecisionTreeClassifier({});
            if (feature_remains.length == 0){
                feature_remains = true;
            }
            branch.child = child.fit(data_modified, feature_remains, y);

            return branch;
        });

        return tree;
    },
    predict: function(X, value) {
    }
};

module.exports = DecisionTreeClassifier;