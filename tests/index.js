var fs = require('fs'),
    _ = require('underscore')
    file = __dirname + '/iris.json',
    RandomForestClassifier = require('../index.js').RandomForestClassifier;


fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        console.log('Error reading iris json file: ' + err);
    }

    data = JSON.parse(data);

    // remove ten items for the testdata
    var testdata = [];
    for (var i=0; i < 10; i++){
        var ran_num = Math.floor(Math.random() * (data.length - 0 + 1));
        testdata.push(data[ran_num]);
        data = _.without(data, data[ran_num]);
    }

    var rf = new RandomForestClassifier({
      n_estimators: 10
    });

    rf.fit(data, null, "species", function(err, trees){
        //console.log(trees);
        //console.log(JSON.stringify(trees, null, 4));
        var expected =  _.pluck(testdata, "species");
        var pred = rf.predict(testdata, trees);
        console.log("outcome:", pred);
        console.log("expected: ", expected);
        var correct = 0;
        for (var i=0; i< pred.length; i++){
            if (pred[i]==expected[i]){
                correct++;
            }
        }
        console.log(correct + "/" + pred.length, (correct/pred.length)*100 + "%", "accurate");
  });
});
