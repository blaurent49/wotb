"use strict";

var addon  = require('./../index');
var should = require('should');
var path = require('path');
var fs = require('fs');

const FILE = path.join(__dirname, 'wot.bin');
const X_PERCENT = 1.0;
const _100_PERCENT = 1.0;
const MAX_DISTANCE_1 = 1;
const MAX_DISTANCE_2 = 2;
const MAX_DISTANCE_3 = 3;
const MAX_DISTANCE_4 = 4;
const MAX_DISTANCE_5 = 5;
const FROM_1_LINK_SENTRIES = 1;
const FROM_2_LINKS_SENTRIES = 2;
const FROM_3_LINKS_SENTRIES = 3;
const __OUTDISTANCED__ = true;
const __OK__ = false;
const MEMORY_MODE = true;
const FILE_MODE = false;

testSuite("MEMORY", MEMORY_MODE);
testSuite("MEMORY 2", MEMORY_MODE);
testSuite("FILE", FILE_MODE);
testSuite("FILE2", FILE_MODE);
testSuite("MEMORY 3", MEMORY_MODE);
testSuite("FILE3", FILE_MODE);

function testSuite(title, mode) {

  function newInstance(launchTests) {
    return () => {
      if (mode == FILE_MODE) {
        let wotb = addon.newFileInstance(FILE);
        launchTests(wotb, () => wotb.resetWoT());
      } else {
        launchTests(addon.newMemoryInstance(), () => null);
      }
    }
  }

  describe(title, () => {


    describe('Basic operations', newInstance((wotb, cleanInstance) => {

      before(cleanInstance);

      it('should have an initial size of 0', function() {
        should.equal(wotb.getWoTSize(), 0);
      });

      it('should not throw if testing isEnabled() with out-of-bounds node', function() {
        should.equal(wotb.isEnabled(0), false);
        should.equal(wotb.isEnabled(23), false);
      });

      it('should give number 0 if we add a node', function() {
        // Add a node
        should.equal(wotb.addNode(), 0);
        should.equal(wotb.getWoTSize(), 1);
        // Add another
        should.equal(wotb.addNode(), 1);
        should.equal(wotb.getWoTSize(), 2);
        // Add 100 nodes
        for (let i = 0; i < 10; i++) {
          should.equal(wotb.addNode(), i + 2);
        }
        should.equal(wotb.getWoTSize(), 2 + 10);
      });

      it('should not throw if testing existsLink() with inbounds link', function() {
        should.equal(wotb.existsLink(4, 6), false);
      });

      it('should not throw if testing existsLink() with out-of-bounds source', function() {
        should.equal(wotb.existsLink(23, 0), false);
      });

      it('should not throw if testing existsLink() with out-of-bounds target', function() {
        should.equal(wotb.existsLink(2, 53), false);
      });

      it('first 4 nodes should be enabled', function() {
        should.equal(wotb.isEnabled(0), true);
        should.equal(wotb.isEnabled(1), true);
        should.equal(wotb.isEnabled(2), true);
        should.equal(wotb.isEnabled(3), true);
      });

      it('last node should be enabled', function() {
        should.equal(wotb.isEnabled(11), true);
      });

      it('should be able to disable some nodes', function() {
        should.equal(wotb.setEnabled(false, 0), false);
        should.equal(wotb.setEnabled(false, 1), false);
        should.equal(wotb.setEnabled(false, 2), false);
        should.equal(wotb.setEnabled(true, 1), true);
      });

      it('nodes 0 and 2 should be disabled', function() {
        should.equal(wotb.isEnabled(0), false);
        should.equal(wotb.isEnabled(1), true);
        should.equal(wotb.isEnabled(2), false);
        should.equal(wotb.isEnabled(3), true);
        // Set enabled again
        should.equal(wotb.setEnabled(true, 0), true);
        should.equal(wotb.setEnabled(true, 1), true);
        should.equal(wotb.setEnabled(true, 2), true);
        should.equal(wotb.setEnabled(true, 1), true);
      });

      it('should not exist a link from 2 to 0', function() {
        should.equal(wotb.existsLink(2, 0), false);
      });

      it('should be able to add some links', function() {
        should.equal(wotb.addLink(2, 0), 1);
        should.equal(wotb.addLink(4, 0), 2);
        should.equal(wotb.addLink(4, 0), 2);
        should.equal(wotb.addLink(4, 0), 2);
        should.equal(wotb.addLink(5, 0), 3);
      });

      it('should exist new links', function() {
        /**
         * WoT is:
         *
         * 2 --> 0
         * 4 --> 0
         * 5 --> 0
         */
        should.equal(wotb.existsLink(2, 0), true);
        should.equal(wotb.existsLink(4, 0), true);
        should.equal(wotb.existsLink(5, 0), true);
        should.equal(wotb.existsLink(2, 1), false);
      });

      it('should be able to remove some links', function() {
        should.equal(wotb.removeLink(4, 0), 2);
        /**
         * WoT is now:
         *
         * 2 --> 0
         * 5 --> 0
         */
      });

      it('should exist less links', function() {
        should.equal(wotb.existsLink(2, 0), true);
        should.equal(wotb.existsLink(4, 0), false);
        should.equal(wotb.existsLink(5, 0), true);
        should.equal(wotb.existsLink(2, 1), false);
      });

      it('should successfully use distance rule', function() {
        should.equal(wotb.isOutdistanced(0, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OK__); // No because 2,4,5 have certified him
        should.equal(wotb.isOutdistanced(0, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OK__); // No because only member 2 has 2 certs, and has certified him
        should.equal(wotb.isOutdistanced(0, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OK__); // No because no member has issued 3 certifications
        // We add links from member 3
        should.equal(wotb.addLink(3, 1), 1);
        should.equal(wotb.addLink(3, 2), 1);
        /**
         * WoT is now:
         *
         * 2 --> 0
         * 5 --> 0
         * 3 --> 1
         * 3 --> 2
         */
        should.equal(wotb.isOutdistanced(0, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OUTDISTANCED__); // KO: No path 3 --> 0
        should.equal(wotb.isOutdistanced(0, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OUTDISTANCED__); // KO: No path 3 --> 0
        should.equal(wotb.isOutdistanced(0, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OK__); // OK: no sentry with 3 links issued
        should.equal(wotb.isOutdistanced(0, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_2, X_PERCENT), __OK__); // OK: 3 --> 2 --> 0
      });

      it('should have 12 nodes', function() {
        should.equal(wotb.getWoTSize(), 12);
      });

      it('delete top node', function() {
        should.equal(wotb.removeNode(), 10);
      });

      it('should have 11 nodes', function() {
        should.equal(wotb.getWoTSize(), 11);
      });

      it('should work with member 3 disabled', function() {
        // With member 3 disabled (non-member)
        should.equal(wotb.setEnabled(false, 3), false);
        should.equal(wotb.isOutdistanced(0, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, X_PERCENT), __OK__); // OK: No path 3 --> 0, but is disabled
      });

      after(cleanInstance);
    }));

    describe('Building a larger WoT', newInstance((wotb, cleanInstance) => {

      before(() => {
        cleanInstance();
        /**
         * We build WoT:
         *
         * 0 --> 1 --> 2 --> 4 --> 5 <==> 6 --> 7
         *             ^
         *            ||
         *            ##==> 3 <-- 8 <-- 9 <========##
         *                       |                 ||
         *                       `> 10 <==> 11 <===##
         */
        // Add nodes
        for (let i = 0; i < 12; i++) {
          should.equal(wotb.addNode(), i);
        }
        // First line
        should.equal(wotb.addLink(0, 1), 1);
        should.equal(wotb.addLink(1, 2), 1);
        should.equal(wotb.addLink(2, 4), 1);
        should.equal(wotb.addLink(4, 5), 1);
        should.equal(wotb.addLink(5, 6), 1);
        should.equal(wotb.addLink(6, 7), 1);
        should.equal(wotb.addLink(6, 5), 2);
        // 2n level
        should.equal(wotb.addLink(2, 3), 1);
        should.equal(wotb.addLink(3, 2), 2);
        should.equal(wotb.addLink(8, 3), 2);
        should.equal(wotb.addLink(9, 8), 1);
        // 3rd level
        should.equal(wotb.addLink(8, 10), 1);
        should.equal(wotb.addLink(10, 11), 1);
        should.equal(wotb.addLink(11, 10), 2);
        should.equal(wotb.addLink(11, 9), 1);
        should.equal(wotb.addLink(9, 11), 2);

        should.equal(wotb.getWoTSize(), 12);
        return Promise.resolve();
      });

      it('should have an initial size of 0', function() {
        should.equal(wotb.getWoTSize(), 12);
      });

      describe('testing around 2 with d = 1', () => {

        /**
         * Sentries of 1 link (X are not sentries):
         *
         * 0 --> 1 --> 2 --> 4 --> 5 <==> 6 --> X
         *             ^
         *            ||
         *            ##==> 3 <-- 8 <-- 9 <========##
         *                       |                 ||
         *                       `> 10 <==> 11 <===##
         */
          // => It can be seen 0..6, 8..11 = 11 sentries
          // => MINUS the sentry #2 (which is tested and is not to be included)
          // => 10 sentries

        it('distance k = 1', function() {
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, _100_PERCENT), __OUTDISTANCED__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, 0.5), __OUTDISTANCED__);
          // 20% of the sentries: OK
          // => 20% x 10 = 2 sentries to reach
          // => we have 1 --> 2
          // => we have 3 --> 2
          // => OK (1,3)
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, 0.2), __OK__);
          // Who can pass 20% can pass 10%
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, 0.1), __OK__);
          // But cannot pass 21%
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_1, 0.21), __OUTDISTANCED__);
        });

        it('distance k = 2', function() {
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, _100_PERCENT), __OUTDISTANCED__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.5), __OUTDISTANCED__);
          // 40% of the sentries: OK
          // => 40% x 10 = 4 sentries to reach
          // With k = 2 we have the following paths:
          // 0 --> 1 --> 2
          // 8 --> 3 --> 2
          // => OK (0,1,8,3)
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.4), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.3), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.2), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.1), __OK__);
          // But cannot pass 41%
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_2, 0.41), __OUTDISTANCED__);
        });

        it('distance k = 5', function() {
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, _100_PERCENT), __OUTDISTANCED__);
          // 70% of the sentries: OK
          // => 70% x 10 = 7 sentries to reach
          // With k = 5 we have the following paths:
          // 0 --> 1 --> 2
          // 10 --> 11 --> 9 --> 8 --> 3 --> 2
          // => OK (0,1,10,11,9,8,3)
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, 0.7), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, 0.3), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, 0.2), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, 0.1), __OK__);
          // But cannot pass 71%
          should.equal(wotb.isOutdistanced(2, FROM_1_LINK_SENTRIES, MAX_DISTANCE_5, 0.71), __OUTDISTANCED__);
        });
      });

      describe('testing around 2 with d = 2', () => {
        /**
         * Sentries of 2 links (X are not sentries):
         *
         * X --> X --> 2 --> X --> X <==> 6 --> X
         *             ^
         *            ||
         *            ##==> X <-- 8 <-- 9 <========##
         *                       |                 ||
         *                       `> X  <==> 11 <===##
         */
          // => It can be seen 2,6,8,9,11 = 5 sentries
          // => MINUS the sentry #2 (which is tested and is not to be included)
          // => 4 sentries

        it('distance k = 1', function() {
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_5, _100_PERCENT), __OUTDISTANCED__);
          // With k = 1 we have no paths
          // => ALWAYS KO
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, 0.99), __OUTDISTANCED__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, 0.5), __OUTDISTANCED__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_1, 0.01), __OUTDISTANCED__);
        });

        it('distance k = 2', function() {
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_2, _100_PERCENT), __OUTDISTANCED__);
          // 25% of the sentries: OK
          // => 25% x 4 = 1 sentries to reach
          // With k = 2 we have the following paths:
          // 8 --> X --> 2
          // => OK (8)
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_2, 0.25), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_2, 0.24), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_2, 0.251), __OUTDISTANCED__);
        });

        it('distance k = 3', function() {
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_3, _100_PERCENT), __OUTDISTANCED__);
          // 50% of the sentries: OK
          // => 50% x 4 = 2 sentries to reach
          // With k = 5 we have the following paths:
          // 9 --> 8 --> X --> 2
          // => OK (9,8)
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_3, 0.50), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_3, 0.49), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_3, 0.51), __OUTDISTANCED__);
        });

        it('distance k = 4', function() {
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_4, _100_PERCENT), __OUTDISTANCED__);
          // 75% of the sentries: OK
          // => 75% x 4 = 3 sentries to reach
          // With k = 5 we have the following paths:
          // 11 --> 9 --> 8 --> X --> 2
          // => OK (11,9,8)
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_4, 0.75), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_4, 0.74), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_4, 0.76), __OUTDISTANCED__);
        });

        it('distance k = 5', function() {
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_5, _100_PERCENT), __OUTDISTANCED__);
          // 75% of the sentries: OK
          // => 75% x 4 = 3 sentries to reach
          // With k = 5 we have the following paths:
          // 11 --> 9 --> 8 --> X --> 2
          // => OK (11,9,8)
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_5, 0.75), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_5, 0.74), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_2_LINKS_SENTRIES, MAX_DISTANCE_5, 0.76), __OUTDISTANCED__);
        });
      });

      describe('testing around 2 with d = 3', () => {
        /**
         * Sentries of 3 links (X are not sentries):
         *
         * X --> X --> 2 --> X --> X <==> X --> X
         *             ^
         *            ||
         *            ##==> X <-- X <-- X <========##
         *                       |                 ||
         *                       `> X  <==> X <===##
         */
          // => It can be seen 2 = 1 sentries
          // => MINUS the sentry #2 (which is tested and is not to be included)
          // => 0 sentries
          // => ALWAYS OK, no sentries to constraint

        it('distance k = 1', function() {
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_1, _100_PERCENT), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_1, 0.01), __OK__);
        });

        it('distance k = 2', function() {
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_2, _100_PERCENT), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_2, 0.01), __OK__);
        });

        it('distance k = 5', function() {
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_5, _100_PERCENT), __OK__);
          should.equal(wotb.isOutdistanced(2, FROM_3_LINKS_SENTRIES, MAX_DISTANCE_5, 0.01), __OK__);
        });
      });

      after(cleanInstance);
    }));
  });
}