var fs = require('fs'),
    file = __dirname + '/iris.json',
    RandomForestClassifier = require('../index.js').RandomForestClassifier;

// 0 == setosa
// 1 == versicolor
// 2 == virginica

var testdata = [{
    "length":6.9,
    "width":3.1,
    "petal_length":5.1,
    "petal_width":2.3,
    //"species":"virginica"
  },
  {
    "length":5.1,
    "width":3.8,
    "petal_length":1.5,
    "petal_width":0.3,
    //"species":"setosa"
  },
  {
    "length":5,
    "width":2.3,
    "petal_length":3.3,
    "petal_width":1,
    //"species":"versicolor"
  },
  {
    "length":6.2,
    "width":3.4,
    "petal_length":5.4,
    "petal_width":2.3,
    //"species":"virginica"
  },
  {
    "length":4.9,
    "width":3,
    "petal_length":1.4,
    "petal_width":0.2,
    //"species":"setosa"
  },
  {
    "length":4.7,
    "width":3.2,
    "petal_length":1.3,
    "petal_width":0.2,
    //"species":"setosa"
  }
];


fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        console.log('Error reading iris json file: ' + err);
    }

    data = JSON.parse(data);

    var rf = new RandomForestClassifier({
      n_estimators: 20
    });

    rf.fit(data, null, "species", function(err, trees){
        //console.log(trees);
        //console.log(JSON.stringify(trees, null, 4));
        var pred = rf.predict(testdata, trees);
        console.log(pred);
  });
});