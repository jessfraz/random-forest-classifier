## Random Forest

A random forest classifier. A random forest is a meta estimator that fits a number of decision tree classifiers on various sub-samples of the dataset and use averaging to improve the predictive accuracy and control over-fitting.

Modeled after [scikit-learn's RandomForestClassifier](http://scikit-learn.org/dev/modules/generated/sklearn.ensemble.RandomForestClassifier.html).

### Installation
```bash
$ npm install random-forest-classifier
```

### Example

```javascript
var fs = require('fs'),
    RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;

var data = [
  {
    "length":5.1,
    "width":3.5,
    "petal_length":1.4,
    "petal_width":0.2,
    "species":"setosa"
  },
  {
    "length":6.5,
    "width":3,
    "petal_length":5.2,
    "petal_width":2,
    "species":"virginica"
  },
  {
    "length":6.6,
    "width":3,
    "petal_length":4.4,
    "petal_width":1.4,
    "species":"versicolor"
  }...
];

var testdata = [{
    "length":6.3,
    "width":2.5,
    "petal_length":5,
    "petal_width":1.9,
    //"species":"virginica"
  },
  {
    "length":4.7,
    "width":3.2,
    "petal_length":1.3,
    "petal_width":0.2,
    //"species":"setosa"
  }...
];

var rf = new RandomForestClassifier({
    n_estimators: 10
});

rf.fit(data, null, "species", function(err, trees){
  //console.log(JSON.stringify(trees, null, 4));
  var pred = rf.predict(testdata, trees);

  console.log(pred);

  // pred = ["virginica", "setosa"]
});
```

### Usage

#### Options

**`n_estimators`:** *integer, optional (default=10)* The number of trees in the forest.

**example**

```javascript
var rf = new RandomForestClassifier({
    n_estimators: 20
});
```

##### `rf.fit(data, features, target, function(err, trees){})`

Build a forest of trees from the training set (data, features, target).

**parameters**

- **`data`**: training data array
- **`features`**: if `null` it defaults to all features except the target, otherwise it only uses the array of features passed
- **`target`**: the target feature

**example**
```javascript
var rf = new RandomForestClassifier({
    n_estimators: 20
});

rf.fit(data, ["length", "width"], "species", function(err, trees){
  console.log(JSON.stringify(trees, null, 4));
});
```

##### `rf.predict(data, trees)`

The predicted class of an input sample is computed as the majority prediction of the trees in the forest.

**parameters**

- **`data`**: input sample
- **`trees`**: the forest of trees outputted by `rf.fit`

**example**
```javascript
var rf = new RandomForestClassifier({
    n_estimators: 20
});

rf.fit(data, ["length", "width"], "species", function(err, trees){

  var pred = rf.predict(sample_data, trees);

  console.log(pred);
  // pred = ["virginica", "setosa"]
});
```



