/*
    A random forest classifier.

    A random forest is a meta estimator that fits a number of decision tree
    classifiers on various sub-samples of the dataset and use averaging to
    improve the predictive accuracy and control over-fitting.

    Parameters
    ----------
    n_estimators : integer, optional (default=10)
        The number of trees in the forest.

    criterion : string, optional (default="gini")
        The function to measure the quality of a split. Supported criteria are
        "gini" for the Gini impurity and "entropy" for the information gain.
        Note: this parameter is tree-specific.

    max_features : int, float, string or None, optional (default="auto")
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
        Note: this parameter is tree-specific.

    max_depth : integer or None, optional (default=None)
        The maximum depth of the tree. If None, then nodes are expanded until
        all leaves are pure or until all leaves contain less than
        min_samples_split samples.
        Ignored if ``max_samples_leaf`` is not None.
        Note: this parameter is tree-specific.

    min_samples_split : integer, optional (default=2)
        The minimum number of samples required to split an internal node.
        Note: this parameter is tree-specific.

    min_samples_leaf : integer, optional (default=1)
        The minimum number of samples in newly created leaves.  A split is
        discarded if after the split, one of the leaves would contain less then
        ``min_samples_leaf`` samples.
        Note: this parameter is tree-specific.

    max_leaf_nodes : int or None, optional (default=None)
        Grow trees with ``max_leaf_nodes`` in best-first fashion.
        Best nodes are defined as relative reduction in impurity.
        If None then unlimited number of leaf nodes.
        If not None then ``max_depth`` will be ignored.
        Note: this parameter is tree-specific.

    verbose : int, optional (default=0)
        Controls the verbosity of the tree building process.
*/

var async = require('async'),
    utils = require('../utilities'),
    DecisionTreeClassifier = require('../tree');

var RandomForestClassifier = function(params) {
    this.n_estimators = params.n_estimators || 10;
    this.criterion = params.criterion || "entropy";
    this.max_features = params.max_features || "auto";
    this.min_samples_split = params.min_samples_split || 2;
    this.min_samples_leaf = params.min_samples_leaf || 1;
    this.verbose = this.verbose || 0;
};

var _parallel_build_tree = function(data, features, y) {
    return function (n, next) {
        var CLF = new DecisionTreeClassifier({});
        var tree = CLF.fit(data, features, y);
        CLF.model = tree;
        next(null, CLF);
    };
};

RandomForestClassifier.prototype = {
    fit: function(data, features, y, cb) {
        // initialize & fit trees
        // this is done async because it can be independent
        async.times(this.n_estimators, _parallel_build_tree(data, features, y), function(err, trees) {
            if (err) { console.log(err); }

            cb(err, trees);
        });
    },
    predict: function(data, trees) {
        this.trees = trees;
        var probabilities = new Array(data.length);
        for (var i=0; i < data.length ;i++) {
            var dec = [];
            for (var j=0; j < this.n_estimators; j++){
                dec.push(trees[i].predict(data[i]));
            }
            if (utils.GetType(dec[0]) == "string"){
                probabilities[i] = utils.GetDominate(dec);
            } else {
                probabilities[i] = utils.Average(dec);
            }
        }
        return probabilities;
    }
};

module.exports = RandomForestClassifier;
