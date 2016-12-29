/* global describe, it, assert, serverData, h54s, getRandomAsciiChars, proclaim */
describe('h54s integration -', function() {
  describe('Characters and tables tests:', function() {

    it('Test json character escape', function(done) {
      this.timeout(10000);
      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });

      var data0 = "\\\"/\/\?''";
      var data1 = "asd\nasd\tasd\r\nasdasd" + String.fromCharCode(10) + "asd";

      var table = new h54s.Tables([
        {
          data0: data0,
          data1: data1
        }
      ], 'data');

      sasAdapter.login(serverData.user, serverData.pass, function() {
        sasAdapter.call('BounceData', table, function(err, res) {
          assert.isUndefined(err, 'We got error on sas program ajax call');
          assert.isDefined(res, 'Response is undefined');
          assert.equal(res.outputdata[0].DATA0, data0, 'Bounce data is different - data0');
          assert.equal(res.outputdata[0].DATA1, data1, 'Bounce data is different - data1');
          done();
        });
      });
    });

    it('Test ascii characters', function(done) {
      this.timeout(10000);
      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        debug: true,
        metadataRoot: serverData.metadataRoot
      });

      var chars = {};
      for(var i = 32; i < 128; i++) {
        chars['data' + i] = String.fromCharCode(i);
      }

      var table = new h54s.Tables([chars], 'data');

      sasAdapter.call('BounceData', table, function(err, res) {
        assert.isUndefined(err, 'We got error on sas program ajax call');
        assert.isDefined(res, 'Response is undefined');
        for(var i = 32; i < 128; i++) {
          assert.equal(res.outputdata[0]['DATA' + i], chars['data' + i], chars['data' + i] + ' character is not the same in response');
        }
        done();
      });
    });

    it('Test big ascii string', function(done) {
      this.timeout(30000);
      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });
      var data = getRandomAsciiChars(10000);

      proclaim.throws(function() {
        new h54s.Tables([
          {
            data1: data,
            data2: data,
            data3: data,
            data4: data
          }
        ], 'data');
      }, 'Row 0 exceeds size limit of 32kb');

      proclaim.throws(function() {
        new h54s.Tables([
          {
            data1: data
          }, {
            data1: data,
            data2: data,
            data3: data,
            data4: data
          }
        ], 'data');
      }, 'Row 1 exceeds size limit of 32kb');

      proclaim.doesNotThrow(function() {
        var rows = [
          {
            data: 0 + ' ' + data
          }, {
            data: 1 + ' ' + data
          }, {
            data: 2 + ' ' + data
          }, {
            data: 3 + ' ' + data
          }, {
            data: 4 + ' ' + data
          }, {
            data: 5 + ' ' + data
          }, {
            data: 6 + ' ' + data
          }, {
            data: 7 + ' ' + data
          }, {
            data: 8 + ' ' + data
          }, {
            data: 9 + ' ' + data
          }, {
            data: 10 + ' ' + data
          }, {
            data: 11 + ' ' + data
          }
        ];

        var table = new h54s.Tables(rows, 'data');

        sasAdapter.call('BounceData', table, function(err, res) {
          assert.isUndefined(err, 'We got error on sas program ajax call');
          assert.isDefined(res, 'Response is undefined');
          assert.equal(res.outputdata.length, 12, 'Received less rows than sent');
          for(var i = 0; i < res.outputdata.length; i++) {
            assert.equal(res.outputdata[i].DATA, rows[i].data, 'Row ' + i + ' is not the same in response');
          }
          done();
        });
      });
    });

    it('Test big table', function(done) {
      this.timeout(30000);
      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });

      var str = getRandomAsciiChars(1000);
      var rows = [];

      //70kb
      for(var i = 0; i < 700; i++) {
        rows.push({
          data: i + str
        });
      }

      var table = new h54s.Tables(rows, 'data');

      sasAdapter.call('BounceData', table, function(err, res) {
        assert.isUndefined(err, 'We got error on sas program ajax call');
        assert.isDefined(res, 'Response is undefined');
        assert.equal(res.outputdata.length, 700, 'Received less rows than sent');
        done();
      });
    });

    it('Test call method with SasData table', function(done) {
      this.timeout(10000);

      var data = [
        {
          data: 'test'
        }
      ];

      var table = new h54s.SasData(data, 'data');

      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });

      sasAdapter.login(serverData.user, serverData.pass, function(status) {
        sasAdapter.call('bounceUploadData', table, function(err, res) {
          assert.isUndefined(err, 'We got error on sas program ajax call');
          assert.deepEqual(res.data, data, 'Bounce data is different');
          done();
        });
      });
    });

    it('Test call method with multiple SasData tables', function(done) {
      this.timeout(10000);
      var data1 = [
        {
          data: 'test1'
        }
      ];
      var data2 = [
        {
          data: 'test2'
        }
      ];
      var sasData = new h54s.SasData(data1, 'data1table');
      sasData.addTable(data2, 'data2table');

      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });

      sasAdapter.call('bounceUploadData', sasData, function(err, res) {
        assert.isUndefined(err, 'We got error on sas program ajax call');
        assert.deepEqual(res.data1, data1, 'Bounce data is different');
        assert.deepEqual(res.data2, data2, 'Bounce data is different');
        done();
      });
    });

    it('Test call methor with table and file in SasData object', function(done) {
      this.timeout(10000);

      var file = new File(['test file content, utf-8 content: ', 'ŠĐŽČĆšđžčć'], 'testName', {type: 'text/plain;charset=UTF-8'});
      var sasData = new h54s.SasData(file, 'fileMacro');

      var data = [
        {
          data: 'test'
        }
      ];
      sasData.addTable(data, 'table');

      var sasAdapter = new h54s({
        hostUrl: serverData.url,
        metadataRoot: serverData.metadataRoot
      });

      sasAdapter.call('bounceUploadFile', sasData, function(err, res) {
        debugger;
        assert.isUndefined(err, 'We got error on sas program ajax call');
        assert.equal(file.size, res.infoDataset[0].CONTENT_LENGTH, 'File length different');
        assert.equal(file.name, res.infoDataset[0].FILENAME, 'File name different');
        assert.equal('fileMacro', res.infoDataset[0].NAME, 'Macro different');
        assert.deepEqual(res.data, data, 'Bounce data is different');
        done();
      });
    });

  });
});
