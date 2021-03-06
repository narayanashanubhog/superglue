var should        = require("should"),
    events        = require("../lib/storage/index"),
    Listener      = events.Listener,
    GroupListener = events.GroupListener;

describe("lib/storage/index", function () {

  it("should expose certain properties", function () {
    events.should.have.properties("match", "Listener", "GroupListener");
    events.match.should.be.Function;
    events.Listener.should.be.Function;
    events.GroupListener.should.be.Function;
  });

  describe("ParentListener", function () {

    describe(".isSaved()", function () {

      it("should shine through the child classes", function () {
        new Listener().should.have.property("isSaved").and.be.Function;
        new GroupListener().should.have.property("isSaved").and.be.Function;
      });

      it("should determine whether ._id is set", function () {
        var l = new Listener();
        var g = new GroupListener();

        // if id isn't set, it should be false
        
        (l._id === null).should.be.true;
        (g._id === null).should.be.true;
        
        l.isSaved().should.be.false;
        g.isSaved().should.be.false;

        // once id is set, it should be true

        l._id = 1;
        g._id = 1;

        l.isSaved().should.be.true;
        g.isSaved().should.be.true;
      });

    });

    describe(".addEventName()", function () {

      it("should add an event name when given a non-empty string", function () {
        var l = new Listener();
        var g = new GroupListener();
        // should work
        l.addEventName("event-name").eventNames.should.have.length(1);
        g.addEventName("event-name").eventNames.should.have.length(1);
        // make sure its what we think it is
        l.eventNames[0].should.equal("event-name");
        g.eventNames[0].should.equal("event-name");
        // should not work
        l.addEventName("")
          .addEventName()
          .addEventName(null)
          .addEventName(true)
          .addEventName(1)
          .addEventName({name:"event-name"})
          .addEventName(["event-name"]);
        g.addEventName("")
          .addEventName()
          .addEventName(null)
          .addEventName(true)
          .addEventName(1)
          .addEventName({name:"event-name"})
          .addEventName(["event-name"]);
        l.eventNames.should.have.length(1);
        g.eventNames.should.have.length(1);
      });
    });

  });

  describe(".Listener", function () {

    it("should have expected properties", function () {
      var l = new Listener();
      l.should.have.properties({
        _id           : null,
        eventNames   : [],
        logic        : [],
        predicates   : [],
        dependencies : []
      });
    });

    describe(".addLogic()", function () {

      it("should add a callback when given a function", function () {
        var l = new Listener().addLogic(function () {});
        l.logic.should.have.length(1);
        l.logic[0].should.be.Function;
        // should not work
        l.addLogic()
         .addLogic(null)
         .addLogic(true)
         .addLogic(1)
         .addLogic("c")
         .addLogic({c:1})
         .addLogic(["c"]);
        l.logic.should.have.length(1);
      });

    });

    describe(".addDependency()", function () {

      it("should add a callback when given a function", function () {
        var l = new Listener().addDependency(function () {});
        l.dependencies.should.have.length(1);
        l.dependencies[0].should.be.Function;
        // should not work
        l.addDependency()
         .addDependency(null)
         .addDependency(true)
         .addDependency(1)
         .addDependency("c")
         .addDependency({c:1})
         .addDependency(["c"]);
        l.dependencies.should.have.length(1);
      });

    });

    describe(".addPredicate()", function () {

      it("should add a callback when given a function", function () {
        var l = new Listener().addPredicate(function () {});
        l.predicates.should.have.length(1);
        l.predicates[0].should.be.Function;
        // should not work
        l.addPredicate()
         .addPredicate(null)
         .addPredicate(true)
         .addPredicate(1)
         .addPredicate("c")
         .addPredicate({c:1})
         .addPredicate(["c"]);
        l.predicates.should.have.length(1);
      });

    });

    describe("._persist()", function () {
      it("should save when required components present && should update", function () {
        var l = new Listener(),
            startLen = events._listeners().length;

        (l.addEventName("name")._id === null).should.be.true;
        (l.addPredicate(function () {})._id === null).should.be.true;
        (l.addDependency(function () {})._id === null).should.be.true;
        // id should now be set
        (l.addLogic(function () {})._id === null).should.be.false;
        // events should now have 1 more listener registered
        (startLen < events._listeners().length).should.be.true;
        // id should be set correctly
        l._id.should.equal(startLen);
        // make sure it updates afterwards
        l.eventNames.should.have.length(1);
        l.addEventName("name2");
        l.eventNames.should.have.length(2);
        events._listeners()[l._id].eventNames.should.have.length(2);

        // make sure the entire object is the same
        l = new Listener()
              .addEventName("p:name")
              .addLogic(function () {})
              .addPredicate(function () {})
              .addDependency(function () {});
        events._listeners()[l._id].should.have.properties({
          _id           : l._id,
          eventNames   : l.eventNames,
          logic        : l.logic,
          predicates   : l.predicates,
          dependencies : l.dependencies
        });
      });
    });

  });

  describe(".GroupListener", function () {

    it("should have expected properties", function () {
      var g = new GroupListener();
      g.should.have.properties({
        _id           : null,
        eventNames   : [],
        fire         : []
      });
    });

    describe(".addFire", function () {

      it("should exist and be a function", function () {
        var g = new GroupListener();
        g.should.have.property("addFire").and.be.Function;
      });

      it("should add an event name to be fired when given a string", function () {
        var g = new GroupListener();
        g.addFire("event-name").fire.should.have.length(1);
        g.addFire("").addFire().addFire(1).fire.should.have.length(1);
      });

    });

    describe("._persist()", function () {

      it("should save when required components present && should update", function () {
        var g = new GroupListener(),
            startLen = events._groups().length;

        (g.addEventName("name")._id === null).should.be.true;
        // id should now be set
        (g.addFire("event-name")._id === null).should.be.false;
        // events should now have 1 more listener registered
        (startLen < events._groups().length).should.be.true;
        // id should be set correctly
        g._id.should.equal(startLen);
        // make sure it updates afterwards
        g.eventNames.should.have.length(1);
        g.addEventName("name2");
        g.eventNames.should.have.length(2);
        events._groups()[g._id].eventNames.should.have.length(2);

        // make sure the entire object is the same
        c = new GroupListener()
              .addEventName("c:name")
              .addFire("c:fire");
        events._groups()[c._id].should.have.properties({
          _id           : c._id,
          eventNames   : c.eventNames,
          fire         : c.fire
        });
      });

    });

  });

  describe(".match()", function () {

    it("should return subscriber when matching a name", function () {
      var anon = function () {};
      var Listener = events.Listener;

      new Listener()
        .addEventName("match:name1")
        .addLogic(anon);
      new Listener()
        .addEventName("match:name2")
        .addLogic(anon)
        .addPredicate(anon);
      new Listener()
        .addEventName("match:name2")
        .addLogic(anon)
        .addDependency(anon);

      events.match("match:name1").should.have.length(1);
      events.match("match:name2").should.have.length(2);
      events.match("match:name2")[0].should.have.property("predicates").with.length(1);
      events.match("match:name2")[1].should.have.property("predicates").with.length(0);
      events.match("match:name2")[1].should.have.property("dependencies").with.length(1);
      events.match("match:name:1").should.have.length(0);
    });

    it("should return subscribers in a group when given a matching group name", function () {
      var GroupListener = events.GroupListener;

      new GroupListener()
        .addEventName("match:group")
        .addFire("match:name1")
        .addFire("match:name2");

      events.match("match:group").should.have.length(3);
    });

    it("should be able to extract groups & subscribers with the same event name", function () {
      var subs;

      new events.Listener()
        .addEventName("match:group")
        .addLogic(function () {});

      events.match("match:group").should.have.length(4);
    });

    it("when groups & subscribers are both returned, subscribers should come first (specificity wins)", function () {
      events.match("match:group")[0].eventNames.should.containDeep(["match:group"]);
    });

  });

  describe(".flush", function () {

    var name = "flush:name";

    it("should exist and be a function", function () {
      events.flush.should.be.a.Function;
    });

    it("should remove listeners & groups that have the same event name", function () {
      new events.Listener()
        .addEventName(name)
        .addLogic(function () {});

      new events.Listener()
        .addEventName(name)
        .addLogic(function () {});

      new events.Listener()
        .addEventName(name + ":1")
        .addLogic(function () {});

      new events.Listener()
        .addEventName(name + ":2")
        .addLogic(function () {});

      new events.GroupListener()
        .addEventName(name)
        .addFire(name + ":1")
        .addFire(name + ":2");

      // should return both "flush:name" listeners + "flush:name:1" & "2" listeners
      events.match(name).should.have.length(4);
      events.flush(name);
      events.match(name).should.have.length(0);
      // make sure that only the group name was deleting, not "flush:name:1" & "2"
      events.match(name + ":1").should.have.length(1);
      events.match(name + ":2").should.have.length(1);
    });

    it("should only remove the matching event-name if there is more than 1 name", function () {
      new events.Listener()
        .addEventName(name)
        .addEventName(name + ":another")
        .addLogic(function () {});

      new events.GroupListener()
        .addEventName(name)
        .addEventName(name + ":another")
        .addFire(name + ":1");

      events.match(name).should.have.length(2);
      events.flush(name);
      events.match(name).should.have.length(0);
      events.match(name + ":another").should.have.length(2);
    });

  });

});