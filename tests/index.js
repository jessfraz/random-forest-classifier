var fs = require('fs'),
    file = __dirname + '/iris.json',
    RandomForestClassifier = require('../index.js').RandomForestClassifier;

var testdata = [{
    "length":6.9,
    "width":3.1,
    "petal.length":5.1,
    "petal.width":2.3,
    "species":"virginica"
  },
  {
    "length":5.1,
    "width":3.8,
    "petal.length":1.5,
    "petal.width":0.3,
    "species":"setosa"
  },
  {
    "length":5,
    "width":2.3,
    "petal.length":3.3,
    "petal.width":1,
    "species":"versicolor"
  },
  {
    "length":6.2,
    "width":3.4,
    "petal.length":5.4,
    "petal.width":2.3,
    "species":"virginica"
  },
  {
    "length":4.9,
    "width":3,
    "petal.length":1.4,
    "petal.width":0.2,
    "species":"setosa"
  }
];


fs.readFile(file, 'utf8', function (err, data) {
  if (err) {
    console.log('Error reading iris json file: ' + err);
  }

  data = JSON.parse(data);

  var rf = new RandomForestClassifier({});

  // find a way to make this sync
  rf.fit(data, null, "species", function(err, trees){
    console.log(JSON.stringify(trees, null, 4));


  });
});