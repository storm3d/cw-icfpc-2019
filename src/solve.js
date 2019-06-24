// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, WaveMatrix, State, Rover, DRILL_TIME, FAST_TIME, InventoryBooster} from "./model/model";
import { MANIPULATOR_PRICE, CLONING_PRICE } from './constants/boosters';

const maxSearchLen = 10000;
const minSearchLen = 3;


export function getTurnType(rotation : number, dx : number, dy : number) : number {
  if((rotation === 0 && dx > 0)
    || (rotation === 3 && dy < 0)
    || (rotation === 6 && dx < 0)
    || (rotation === 9 && dy > 0)) {
      return 1;
  }
  else if((rotation === 0 && dx < 0)
    || (rotation === 3 && dy > 0)
    || (rotation === 6 && dx > 0)
    || (rotation === 9 && dy < 0)) {
      return 2;
  }
  return 0;
}

export function getWorkerTurnType(m: Matrix, curPos: Coord, nextPos: Coord, rotation: number) : number {
  if (m.getFreeNeighborsNum(nextPos.x, nextPos.y, 1) > 0) {
    let dx = -(curPos.x - nextPos.x);
    let dy = -(curPos.y - nextPos.y);

    return getTurnType(rotation, dx, dy);
  }
  return 0;
}

export function findPath(s: State, worker : Rover, banTargets : Array<Coord>, options: Object) {

  let source = worker.pos.getCopy();

  let isDrilling = options.isDrilling || false;
  let fastTime = options.fastTime || -1;

  //let workerCopy = worker.getCopy();
  let seekingBooster = options.seekingBooster;
  let searchLen = seekingBooster ? maxSearchLen : minSearchLen;

  let wavestep = new WaveMatrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  wavestep.set(source.x, source.y, 1, -1, worker.rotation);

  // ban locations
  for(let i = 0; i < banTargets.length; i++) {
    wavestep.set(banTargets[i].x, banTargets[i].y, 33333);
    //console.log("banned " + banTargets[i].x + " " + banTargets[i].x);
  }

  let nearestFree : Coord = 0;
  let bestPixelCost = 0;
  let getCoordNXNY = (c: Coord) : Array<Object> => {
    return [{
          nx : c.x,
          ny : c.y + 1,
        }, {
          nx : c.x + 1,
          ny : c.y,
        }, {
          nx : c.x,
          ny : c.y - 1,
        }, {
          nx : c.x - 1,
          ny : c.y,
        },
      ];
  };
  let getDirs2 = (c: Coord) : Object => {
    let nxny = getCoordNXNY(c);
    return [
        nxny[1],
        nxny[0],
        nxny[3],
        nxny[2],
      ];
  };

  let getNextRotation = (oldPos: Coord, newPos: Coord, rotation: number) => {
    let turnType = getWorkerTurnType(s.m, oldPos, newPos, rotation);
    if (turnType === 1) {
        return worker.getRotCW(rotation);
    } else if (turnType === 2) {
        return worker.getRotCCW(rotation);
    }
    return rotation;
  };

  let tryDirection = (nx: number, ny: number, curLen: number, cIndex: number) : boolean => {
    if(!s.m.isValid(nx, ny) || wavestep.get(nx, ny) === 33333) {
      return false;
    }

    if (seekingBooster && s.checkBooster(nx, ny, seekingBooster, true)) {
      nearestFree = new Coord(nx, ny);
      let nextRotation = getNextRotation(nearestFree, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
      wavestep.set(nx, ny, curLen + 1, cIndex, nextRotation);
      return true;
    }
    if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
      let cost = pixelCost(s.m, nx, ny);

      //let cost = 1;

      if(cost > bestPixelCost || nearestFree === 0) {
        //console.log(cost);
        nearestFree = new Coord(nx, ny);
        bestPixelCost = cost;
        let nextRotation = getNextRotation(nearestFree, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
        wavestep.setPrev(nx, ny, cIndex, nextRotation);
      }
    }
    if ((isDrilling || s.m.isPassable(nx, ny)) && wavestep.get(nx, ny) === 0) {
      let newCoord = new Coord(nx, ny);
      front.push(newCoord);
      //let nextRotation = getNextRotation(newCoord, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
      wavestep.set(nx, ny, curLen + 1, cIndex);
    }
    return false;
  };

  let tryDirectionFasting = (nx: number, ny: number, curLen: number, cIndex: number) : boolean => {
    if(!s.m.isValid(nx, ny)) {
      return false;
    }
    if (!(isDrilling || s.m.isPassable(nx, ny))) {
      return false;
    }
    let c = wavestep.toCoord(cIndex);
    // extrastep
    let nx2 = nx + (nx - c.x);
    let ny2 = ny + (ny - c.y);
    return tryDirection(nx2, ny2, curLen, cIndex);
  };

  let tryAllDirections = (pos: Coord, curLen: number): boolean => {
    let dirs = getDirs2(pos);
    let cIndex = wavestep.toIndex(pos.x, pos.y);
    for (let dirsKey in dirs) {
      let nx = dirs[dirsKey].nx;
      let ny = dirs[dirsKey].ny;

      if (fastTime > curLen) {
        if (tryDirectionFasting(nx, ny, curLen, cIndex))
          return true;
      } else {
        if (tryDirection(nx, ny, curLen, cIndex))
          return true;
      }
    }
    return false;
  };

  ////////////// forward wave
  while(front.length) {
    let c = front.shift();

    let curLen = wavestep.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= searchLen && nearestFree !== 0) {
      //console.log("exceeded range " + curLen);
      break;
    }

    if (tryAllDirections(c, curLen))
      break;
  }

  //console.log(nearestFree);
  //console.log("found " + nearestFree.x + " " + nearestFree.x);

  if(nearestFree === 0)
    return undefined;

  ///////////// backtracking + adjusting for rotations on turns
  let path = [ nearestFree ];
  let btIndex = wavestep.toIndex(nearestFree.x, nearestFree.y);
  let prev = wavestep.prev[btIndex];
  let adjustPathRotations = (r1, r2) => {
      if (r1 != r2) path.unshift(null);
    };

  while (prev >= 0) {
    //adjustPathRotations(wavestep.rotation[btIndex], wavestep.rotation[prev]);
    //btIndex = prev;
    let prevC = wavestep.toCoord(prev);
    prev = wavestep.prev[prev];
    path.unshift(prevC);
  }
  path.shift();
  //adjustPathRotations(wavestep.rotation[btIndex], worker.rotation);

  return path;
}


export function pixelCost(matrix: Matrix, x: number, y: number): number {
  return 10000-matrix.getFreeNeighborsNum(x, y, 2);
}

export default class Solver {

  state : State;
  solution : Solution;
  coins: number = 0;
  hasTeleportInCenter: boolean = false;
  teleports: Array<Object> = [];

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  setCoins(coins: number): number {
    this.coins = coins;
    console.log(`set coins ${coins}`);

    if (this.coins) {
      return this.buyBoosters();
    }

    return 0;
  }

  solve() : Solution {

    this.state.step = 0;
    let boostersNum = 1;

    while(true) {

      for(let workerId = 0; workerId < boostersNum; workerId++) {
        this.solution.setWorkerId(workerId);

        if (this.drillTickUpdate(workerId)) {
          this.tickWorkerBoosters(workerId, 'L');
          continue;
        }

        // do we need to apply booster?
        if (this.applyMainBoosters(workerId)) {
          this.tickWorkerBoosters(workerId);
          continue;
        }

        // find out target
        let boosterSkip = this.findWorkerTarget(workerId);
        // no target found, exiting
        if (boosterSkip === 0)
          return this.solution;

        // booster was applied before new worker target
        if (boosterSkip !== ''){
          this.tickWorkerBoosters(workerId, boosterSkip);
          continue;
        }

        // make worker step
        if (this.stepWorkerPath(workerId))
          this.tickWorkerBoosters(workerId);
      }

      boostersNum = this.state.workers.length;
      this.state.step++;
    }

  }

  applyMainBoosters(workerId: number): boolean {
    let worker = this.state.workers[workerId];
    if(this.state.getAvailableInventoryBoosters('B', workerId) > 0) {
      this.state.spendInventoryBooster('B', workerId);
      let c = this.state.workers[workerId].extendManipulators();
      this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
      return true;
    }
    else if(this.state.getAvailableInventoryBoosters('C', workerId) > 0
        && this.state.checkBooster(worker.pos.x, worker.pos.y, 'X')) {

      this.state.spendInventoryBooster('C', workerId);
      this.state.workers.push(new Rover(worker.pos.getCopy(), 1, 1));
      this.solution.activateCloning();
      this.solution.addWorker();
      return true;
    }
    return false;
  }

  // dumb greedy drills
  tryToApplyDrill(workerId: number, banTargets, options, pathNoDrill) : Object {
    // RETURN null TO DISABLE
    // return null;

    let worker = this.state.workers[workerId];
    worker.isDrilling = false;

    let drillsCount = this.state.getAvailableInventoryBoosters('L', workerId);
    if (drillsCount === 0 && worker.drillTicks === 0)
      return null;

    // LONG DRILLS (WARNING! not safe!)
    // let possibleDrillLen = worker.drillTicks + drillsCount * DRILL_TIME;
    // let drillingLong = true;

    // SHORT DRILLS
    let possibleDrillLen = worker.drillTicks > 0 ? worker.drillTicks : DRILL_TIME;
    let drillingLong = false;

    options.isDrilling = true;
    let pathDrill = findPath(this.state, worker, banTargets, options);

    // no drills if undefined
    if (pathDrill === undefined) {
      return null;
    }

    // consider path if you actually can do it
    let considerDrilling = (pathDrill.length < possibleDrillLen);
    let pathDrillIsShorter = (pathDrill.length + 10) < pathNoDrill;
    // some heuristic to compare path targets
    let p1 = pathDrill[pathDrill.length - 1];
    let p2 = pathNoDrill[pathNoDrill.length - 1];
    let pathDrillIsBetter = pixelCost(this.state.m, p1.x, p1.y) < pixelCost(this.state.m, p2.x, p2.y);
    //console.log([considerDrilling , pathDrill.length, pathNoDrill]);
    if (!(considerDrilling && (pathDrillIsShorter || pathDrillIsBetter))) {
      return null;
    }

    // DRILL TIME!!!
    worker.isDrilling = drillingLong;
    if (worker.drillTicks > 0)
      return {path: pathDrill, boosterSkip: ''}; // no extra drilling

    this.state.spendInventoryBooster('L', workerId);
    this.solution.startUsingDrill();
    worker.drillTicks = DRILL_TIME;
    return {path: pathDrill, boosterSkip: 'L'};
  }

  drillTickUpdate(workerId: number) : boolean {
    let worker = this.state.workers[workerId];

    if (!worker.isDrilling || worker.drillTicks > 0) {
      return false;
    }

    if (this.state.getAvailableInventoryBoosters('L', workerId) === 0) {
      worker.isDrilling = false;
      return false;
    }
    this.state.spendInventoryBooster('L', workerId);
    this.solution.startUsingDrill();
    worker.drillTicks = DRILL_TIME;
    return true;
  }

  // teleports
  tryToPlantTeleport(workerId: number) : boolean {
    let worker = this.state.workers[workerId];
    let matrixCenter = new Coord(this.state.m.w /2 , this.state.m.h /2);

    let teleportsInInventory = this.state.getAvailableInventoryBoosters('R', workerId);
    if (worker.isDrilling || (teleportsInInventory === 0))
      return false;

    // not use it in very small tasks
    if (matrixCenter.x < 20 && matrixCenter.y < 20)
      return false;

    let workerPos = worker.pos;

    // plant teleport near center if we have one
    let isNearCenter = workerPos.isWithinRange(matrixCenter, 20);
    let plantTeleportHere = !this.hasTeleportInCenter && isNearCenter;

    // try another approach:
    let DEBUG_PLANT_MORE_THAN_ONE = true; // TODO: remove
    if (DEBUG_PLANT_MORE_THAN_ONE && !plantTeleportHere) {
      // if there is one TP in center or we have more than one TP in inventory
      if (teleportsInInventory < 2 && !this.hasTeleportInCenter)
        return false;

      // check that it is not too close to another one
      let teleportsNear = this.teleports.filter(t => workerPos.isWithinRange(t.pos, 20));
      plantTeleportHere = teleportsNear.length === 0;
    }

    if (!plantTeleportHere)
      return false;

    ////// now plant teleport:

    // set flag
    if (isNearCenter)
        this.hasTeleportInCenter = true;

    this.state.spendInventoryBooster('R', workerId);
    this.solution.plantTeleport();
    let newTeleport = {
        pos: workerPos.getCopy(),
        path: null,
        updated: this.state.step,
        step: this.state.step,
      };
    this.teleports.push(newTeleport);

    return true;
  }

  applyTeleportBooster(workerId: number, banTargets, options, workerPath) : Object {
    // RETURN null TO DISABLE
    // return null;

    ////////////// check if it can plant TP
    if (this.tryToPlantTeleport(workerId))
      return {path: workerPath, boosterSkip: "*"};

    ////////////// ok, let's see if can use some TPs
    let thisStep = this.state.step;
    // filter available TPs
    let teleports = this.teleports.filter(t => t.step > thisStep);
    if (teleports.length === 0)
      return null;

    let worker = this.state.workers[workerId];

    let bestTeleport = {len: 999999, pos: null, path: null, seekingBooster: null};

    teleports.forEach(teleportObj => {
        if (teleportObj.updated === thisStep)
          return null;

        if (teleportObj.path && (workerPath.length < (teleportObj.path.length + 5)))
          return null;

        // create worker AS IF it teleported
        let worker = this.state.workers[workerId];
        let workerT = worker.getCopy();
        workerT.pos = teleportObj.pos;

        let pathTP = findPath(this.state, workerT, banTargets, options);

        teleportObj.path = pathTP;
        teleportObj.updated = thisStep;
        // no TP-ing if undefined
        if (pathTP === undefined) {
          return null;
        }

        // check if it is better than the best
        if (bestTeleport.len < pathTP.length)
          return null;

        // check if it is better than existing for this worker
        let pathIsBetter = (pathTP.length + 25) < workerPath.length;
        let isWorkerNear = teleportObj.pos.isWithinRange(worker.pos, 10);
        if (!pathIsBetter || isWorkerNear)
          return null;

        bestTeleport = {
            len : pathTP.length,
            pos : teleportObj.pos,
            path: pathTP,
            seekingBooster : options.seekingBooster,
          };

      });


    // check we have a winner TP:
    if (!bestTeleport.pos)
      return null;

    // apply TP pos to worker
    this.solution.activateTeleport(bestTeleport.pos.x, bestTeleport.pos.y);
    this.state.moveWorker(workerId, bestTeleport.pos);
    //
    return {path: bestTeleport.path, boosterSkip: "*"};
  }

  // dumb greedy wheels
  applyWheelsBooster(workerId: number, banTargets, options, workerPath): Object {
    // RETURN null TO DISABLE
    //return null;

    let worker = this.state.workers[workerId];
    if (worker.wheelTicks > 0 || this.state.getAvailableInventoryBoosters('F', workerId) === 0 || worker.drillTicks > 0)
      return null;

    options.fastTime = FAST_TIME;
    let pathFast = findPath(this.state, worker, banTargets, options);
    if (pathFast === undefined) {
      return null;
    }


    this.state.spendInventoryBooster('F', workerId);
    this.solution.attachFastWheels();
    worker.wheelTicks = FAST_TIME;
    return {path: pathFast, boosterSkip: 'F'};

  }

  tickWorkerBoosters(workerId: number, skipBoosterTick: string = '*') : boolean {
    let worker = this.state.workers[workerId];

    if (skipBoosterTick !== 'L' && worker.drillTicks > 0) {
        worker.drillTicks--;
    }
    if (skipBoosterTick !== 'F' && worker.wheelTicks > 0) {
        worker.wheelTicks--;
    }
  }

  findWorkerTarget(workerId: number) {
    if (this.isWorkerHasPath(workerId))
      return '';

    let worker = this.state.workers[workerId];
    let getOptions = (options) => {
        return {fastTime: worker.wheelTicks, seekingBooster: options.seekingBooster};
        };

    let result = ''; // just go for path
    // if path undefined - stop it
    let cb = (path, banTargets, options) => {
      if (path === undefined) {
        if (this.state.m.getFreeNum() === 0) {
          result = 0; // END OF SOLUTION
          return false;
        }
        return true;
      }
      // try drills
      let tryDrill = this.tryToApplyDrill(workerId, banTargets, getOptions(options), path);
      if (tryDrill != null) {
        result = tryDrill.boosterSkip;
        path = tryDrill.path;
        return true;
      }

      // try teleports
      let tryTP = this.applyTeleportBooster(workerId, banTargets, getOptions(options), path);
      if (tryTP != null) {
        result = tryTP.boosterSkip;
        path = tryTP.path;
        return true;
      }

      // try wheels
      let tryW = this.applyWheelsBooster(workerId, banTargets, getOptions(options), path);
      if (tryW != null) {
        result = tryW.boosterSkip;
        path = tryW.path;
        return true;
      }


      return true;
    };
    this.tryFindWorkerTarget(workerId, worker, getOptions({}), cb);

    return result;
  }

  isWorkerHasPath(workerId: number) : boolean {
    let worker = this.state.workers[workerId];
    if(!worker.path || worker.path.length > 0) {
      return true;
    }
    return false;
  }

  isSeekingBooster(workerId: number) : string {
    return !this.state.spawnsPresent ? 0
        : (this.state.getAvailableInventoryBoosters('C', workerId) ? 'X'
        : (this.state.getRemainingCloningNum() ? 'C'
                : this.state.getRemainingUnlockedBoostersNum() ? '*'
                    : ''));
  }

  lockIfCloneBooster(workerId: number, seekingBooster: string) {
    if(seekingBooster === 'X') {
      this.state.lockInventoryBooster('C', workerId);
    }
  }

  applyNewPath(workerId: number, seekingBooster: string, path) {
    let worker = this.state.workers[workerId];
    worker.path = path;
    if(worker.path)
      worker.target = path[path.length - 1];
    else
      worker.target = 0;

    if(worker.target && (seekingBooster === '*' || seekingBooster === 'C')) {
      let b = this.state.checkBooster(worker.target.x, worker.target.y, '*');
      if(b.lockedBy === -1 && b.type !== 'X') {
        b.lockedBy = workerId;
              //console.log("locked "+ b.type);
      }
    }
  }

  tryFindWorkerTarget(workerId: number, worker: Rover, options, cb): boolean {
    let seekingBooster = this.isSeekingBooster(workerId);
    this.lockIfCloneBooster(workerId, seekingBooster);

    // ban other targets
    let banTargets = this.getBannedTargets(workerId);
    options.seekingBooster = seekingBooster;

    let path = findPath(this.state, worker, banTargets, options);
    if (!cb(path, banTargets, options)) {
      return false;
    }

    //console.log("1");
    this.applyNewPath(workerId, seekingBooster, path);
    return true;
  }

  getBannedTargets(workerId: number):Array<Coord> {
    return this.state.workers
                .filter((w, i) => i !== workerId && w.target)
                .map(w => w.target);
  }

  stepWorkerPath(workerId: number) : boolean {
    let worker = this.state.workers[workerId];
    // act on our current path
    if(!worker.path) {
      return false;
    }
    let curPos = worker.pos;
    let nextPos = worker.path[worker.pathStep];

    let turnType = getWorkerTurnType(this.state.m, curPos, nextPos, worker.rotation);
    if (turnType !== 0) {
      if (turnType === 1) { // CW
        this.solution.turnManipulatorsClockwise();
        worker.rotCW();
      } else if (turnType === 2) { // CCW
        this.solution.turnManipulatorsCounterclockwise();
        worker.rotCCW();
      }

      // fake move to apply changes
      this.state.moveWorker(workerId, curPos);
    } else {

        let deltaCoord = curPos.getDiff(nextPos);
        let stepDelta = Math.abs(deltaCoord.x) + Math.abs(deltaCoord.y);
        //  console.log(`delta = ${stepDelta}, ${curPos}, ${nextPos}`);

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ARGH!!!! ERROR - PATH TOO SHORT
        // skip move to ajust to singlesteps
        if ((stepDelta === 1) && (worker.wheelTicks > 0)) {
          this.solution.skipTurn();
          return true;
        }

        // fast move
        if (stepDelta === 2) {
          // create half step move
          let delta2 = new Coord(deltaCoord.x / 2, deltaCoord.y / 2);
          let halfPos = curPos.getAdded(delta2);
          if (worker.wheelTicks > 0) {
            // apply half step move here to update state properly
            this.state.moveWorker(workerId, halfPos);
          } else {
            worker.path.splice(worker.pathStep+1, 0, nextPos);
            nextPos = halfPos;
          }
        }

      // do actual move
        //console.log("moving");
        //console.log(worker.pos);
      this.solution.move(worker.pos, nextPos);
      this.state.moveWorker(workerId, nextPos);

        //console.log("postmoving");

      worker.pathStep++;
      if (worker.pathStep >= worker.path.length) {
        worker.path = [];
        worker.pathStep = 0;
      }
    }
    return true;
  }

  solveOld(): Solution {
    let drillTurns = 0;
    let drilling = false;

    let wheelsTurns = 0;
    //let wheelsAttached = false;

    let hasTeleportInCenter = false;
    let hasActiveTeleport: Array<Object> = [];
    let matrixCenter = new Coord(this.state.m.w /2 , this.state.m.h /2);
    let workerId = 0;

    let isNear = (a: Coord, b: Coord, d: number) => {
      let diff = a.getDiff(b);
      return (Math.abs(diff.x) + Math.abs(diff.y)) < d;
    };
    let isNearCenter = (c: Coord) => {
      return isNear(c, matrixCenter, 20);
    };

    let stepActiveWheels = () => {
      // if Fast is ON
      if (wheelsTurns > 0) {
        wheelsTurns--;
      }
    };
    let stepActiveBoosters = () => {
      // if drill is ON
      if (drillTurns > 0) {
          drillTurns--;
          // continue if drilling
          if (drillTurns === 0 && drilling && this.state.getAvailableInventoryBoosters('L', workerId) > 0){
            this.state.spendInventoryBooster('L', workerId);
            this.solution.startUsingDrill();
            drillTurns = DRILL_TIME;
            stepActiveWheels();
          }
      }
      stepActiveWheels();
      this.state.step++;
    };

    while(true) {

      while (this.state.getAvailableInventoryBoosters('B', workerId) > 0) {
        this.state.spendInventoryBooster('B', workerId);
        let c = this.state.workers[workerId].extendManipulators();
        this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
        stepActiveBoosters();
      }

      let path = findPath(this.state, this.state.workers[workerId], {fastTime: wheelsTurns});
      if (path === undefined && wheelsTurns > 0) {
        // baseline path
        path = findPath(this.state, this.state.workers[workerId], {});
      }
      if (path === undefined) {
        if (this.state.m.getFreeNum() > 0) {
          throw "WUT ???";
        }
        return this.solution;
      }

      //// TELEPORTS: ///////////////////////////
      let bestTeleport = {len: 999999, pos: null, path: null};
      hasActiveTeleport.forEach(teleportObj => {
        if (path.length > (teleportObj.path.length + 5)) {
          // get path from teleport for current worker configuration
          let workerT = this.state.workers[workerId].getCopy();
          workerT.pos = teleportObj.pos;
          let teleportPath = findPath(this.state, workerT, {fastTime: wheelsTurns - 1});
          if (teleportPath === undefined) {
            teleportObj.path = findPath(this.state, workerT, {});
          } else {
            teleportObj.path = teleportPath;
          }

          // check if it is better than the best
          if (bestTeleport.len > teleportObj.path.length) {
            // check if it is better than existing
            let pathIsBetter = (teleportObj.path.length + 25 < path.length);
            let isWorkerNear = isNear(teleportObj.pos, this.state.workers[workerId].pos, 10);

            if (pathIsBetter && !isWorkerNear) {
              bestTeleport = {
                  len : teleportObj.path.length,
                  pos : teleportObj.pos,
                  path: teleportObj.path,
                };
            }
          }
        }
      });
      // go to best teleport if any
      if (bestTeleport.pos) {
        this.solution.activateTeleport(bestTeleport.pos.x, bestTeleport.pos.y);
        this.state.moveWorker(workerId, bestTeleport.pos);
        stepActiveBoosters();
        //
        path = bestTeleport.path;
      }

      // greedy teleports :
      let teleportsInInventory = this.state.getAvailableInventoryBoosters('R', workerId);
      if (!drilling && (teleportsInInventory > 0)
          && matrixCenter.x > 20 && matrixCenter.y > 20) {
        let workerPos = this.state.workers[workerId].pos;
        // plant teleport near center if we have only one
        let plantTeleportHere = !hasTeleportInCenter && isNearCenter(workerPos);

        // or if we have spare - then somewhere far apart from existing
        let DEBUG_PLANT_MORE_THAN_ONE = true; // TODO: remove
        if (DEBUG_PLANT_MORE_THAN_ONE && !plantTeleportHere) {
          // if there is one in center or we have more than one in inventory
          plantTeleportHere = hasTeleportInCenter || teleportsInInventory > 0;
          if (plantTeleportHere) {
            // check that it is not too close to another one
            let teleportsNear = hasActiveTeleport.filter(t => isNear(t.pos, workerPos, 20));
            plantTeleportHere = teleportsNear.length === 0;
          }
        }
        if (plantTeleportHere){
          if (isNearCenter(workerPos))
              hasTeleportInCenter = true;
          this.state.spendInventoryBooster('R', workerId);
          this.solution.plantTeleport();
          let newTeleport = {
            pos: workerPos.getCopy(),
            path: path,
            };
          hasActiveTeleport.push(newTeleport);
          stepActiveBoosters();
        }
      }
      //// TELEPORTS END ///////////////////////////

      // dumb greedy drills
      //if (false) {
      if (this.state.getAvailableInventoryBoosters('L', workerId) > 0 || drillTurns > 0) {
          let path1 = findPath(this.state, this.state.workers[workerId], {isDrilling: true, fastTime: wheelsTurns - 1});
          // consider path if you actually can do it
          let considerDrilling = (path1.length < (drillTurns
              + this.state.getAvailableInventoryBoosters('L', workerId) * DRILL_TIME));
          //
          drilling = considerDrilling && ((path1.length + 20 < path.length) );
          if (drilling) {
              //console.log(`!!!!!!!!!!!!${path.length}, ${path1.length}`);
              path = path1;
              if (drillTurns === 0) {
                  this.state.spendInventoryBooster('L', workerId);
                  this.solution.startUsingDrill();
                  drillTurns = DRILL_TIME;
                  stepActiveWheels();
              }
          }
      }
      // console.log(path);


      // dumb wheels
      let ENABLE_WHEELS = true;
      if (ENABLE_WHEELS && wheelsTurns === 0 && this.state.getAvailableInventoryBoosters('F', workerId) > 0 && !drilling) {
        let pathF = findPath(this.state, this.state.workers[workerId], {fastTime: FAST_TIME});
        if (pathF !== undefined) {
          path = pathF;
          this.state.spendInventoryBooster('F', workerId);
          this.solution.attachFastWheels();
          wheelsTurns = FAST_TIME;
        }
      }

      //console.log(path);
      for (let i = 0; i < Math.ceil(path.length /*/ 2*/); i++) {
        // skip fillers
        if (path[i] === null){
          continue;
        }
        let curPos = this.state.workers[workerId].pos;
        let nextPos = path[i];
        let deltaCoord = curPos.getDiff(nextPos);

        let stepDelta = Math.abs(deltaCoord.x) + Math.abs(deltaCoord.y);
        //  console.log(`delta = ${stepDelta}, ${curPos}, ${nextPos}`);

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ARGH!!!! ERROR - PATH TOO SHORT
        // skip move to ajust to singlesteps
        while ((stepDelta === 1) && (wheelsTurns > 0)) {
          this.solution.skipTurn();
          stepActiveBoosters();
        }

        // if ALL OK then this array will have one pair inside
        let moves = [[curPos, nextPos]];
        // fast move
        if (stepDelta === 2) {
          // create half step move
          let delta2 = new Coord(deltaCoord.x / 2, deltaCoord.y / 2);
          let halfPos = curPos.getAdded(delta2);
          if (wheelsTurns > 0) {
            // apply half step move here to update state properly
            this.state.moveWorker(workerId, halfPos);
            moves = [[halfPos, nextPos]]
          } else {
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ARGH!!!! ERROR - PATH TOO LONG
            moves = [[curPos, halfPos], [halfPos, nextPos]];
          }
        }
        for (let move_idx = 0; move_idx < moves.length; move_idx ++) {
          // check for rotations on end of moves chain
          let pos1 = moves[move_idx][0];
          let pos2 = moves[move_idx][1];
          if (move_idx === moves.length - 1) {
            let turnType = getWorkerTurnType(this.state.m, pos1, pos2, this.state.workers[workerId].rotation);
            if (turnType !== 0) {
              if (turnType === 1) { // CW
                this.solution.turnManipulatorsClockwise();
                this.state.workers[workerId].rotCW();
              } else if (turnType === 2) { // CCW
                this.solution.turnManipulatorsCounterclockwise();
                this.state.workers[workerId].rotCCW();
              }
              // update state to apply rotation changes
              this.state.moveWorker(workerId, pos2);
              stepActiveBoosters();
            }
          }

          // do actual move
          this.solution.move(pos1, pos2);
          this.state.moveWorker(workerId, pos2);
          stepActiveBoosters();
        }
        // console.log(this.state.dump(true));
          }
    }

    return this.solution;
  }

  solve_DFS_FreeNum(): Solution {
      let DSFlist = new Map();
      let solution = new Solution();
      solution.state = this.state;

      let calcWeight = (s) => {return s.state.m.getFreeNum();}
      let calcNewTop = (f) => {return Array.from(f.keys()).sort()[0]; }
      let topKey = calcWeight(solution);
      DSFlist.set(topKey, [solution]);

      //console.log(calcNewTop(DSFlist), topKey);

      while(topKey > 0) {
          let top = DSFlist.get(topKey);
          //
          let trySolution = top.shift();

          break;
      }
      return this.solution;
  }

  /** @private */
  buyBoosters(): number {
    let counter = 0;
    while (this.coins >= CLONING_PRICE) {
      this.buyClone();
      counter++;
    }

    return counter;
  }

  /** @private */
  buyManipulator() {
    console.log('buy manipulator');
    this.coins = this.coins - MANIPULATOR_PRICE;

    let acuiredBooster = new InventoryBooster('B', -1, 0);
    this.state.inventoryBoosters.push(acuiredBooster);
  }

  /** @private */
  buyClone() {
    console.log('buy clone');
    this.coins = this.coins - CLONING_PRICE;

    let acuiredBooster = new InventoryBooster('C', -1, 0);
    this.state.inventoryBoosters.push(acuiredBooster);
  }
}
