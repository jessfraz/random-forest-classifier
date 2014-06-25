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
    //this.max_depth = params.max_depth || 5;
    this.num_tries = params.num_tries || 10;
};

DecisionTreeClassifier.prototype = {
    fit: function(data, features, y) {
      var major_label = utils.GetDominate(_.pluck(data, y));
      return utils.C45(data, features, y, major_label, this.num_tries);
    },
    predict: function(sample) {
        var root = this.model;

        if (typeof root === 'undefined') {
            return 'null';
        }

        while (root.type !== "result") {
            var attr = root.name;
            if (root.type === 'feature_real') {
                var sample_value = parseFloat(sample[attr]);
                if (sample_value <= root.cut){
                    child_node = root.vals[1];
                } else {
                    child_node = root.vals[0];
                }
            } else {
                var sample_value = sample[attr];
                var child_node = _.detect(root.vals, function(x) {
                    return x.name == sample_value;
                });
            }
            root = child_node.child;
        }

        return root.val;
    }
};

module.exports = DecisionTreeClassifier;