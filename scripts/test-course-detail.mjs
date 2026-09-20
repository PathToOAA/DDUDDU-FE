import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
let calls=0;
globalThis.__resolve=async(r,i,s,p)=>{calls++;await new Promise(r=>setTimeout(r,10));p(r.routeAnalysis[0]);};
const source=fs.readFileSync('src/api/courseDetail.ts','utf8').replace('import { resolveCourseTransit } from "./kakaoRouteApi";','const resolveCourseTransit = (...args) => globalThis.__resolve(...args);');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {loadCourseDetail,retryCourseDetail,courseSummary}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const route={status:'FOUND',mode:'TRANSIT',fare:1500,paths:[{mode:'TRANSIT',points:[{latitude:37,longitude:129},{latitude:38,longitude:129}]}],legs:[{mode:'BUS',routeName:'21'}]};
const result={conditions:{budget:50000},courses:[{title:'A',days:[]},{title:'B',days:[{day:1,contentIds:['a']}]}],places:[{contentId:'a',title:'해변',latitude:37,longitude:129}],routeAnalysis:[{courseIndex:1,complete:true,durationSeconds:600,walkDistanceMeters:100,transportFareKrw:1500,transfers:[{route}]}]};
const saved=JSON.parse(JSON.stringify(courseSummary(result,1)));
assert.equal(saved.detail.courseIndex,0);
assert.equal(saved.detail.result.courses.length,1);
assert.equal(saved.detail.result.routeAnalysis[0].courseIndex,0);
assert.deepEqual(saved.detail.result.routeAnalysis[0].transfers[0].route,route);
assert.equal(saved.detail.result.places[0].longitude,129);
await loadCourseDetail(saved.detail.result,0);assert.equal(calls,0);
const pending={...saved.detail.result,routeAnalysis:[{...saved.detail.result.routeAnalysis[0],transfers:[{route:{status:'PENDING'}}]}]};
const a=loadCourseDetail(pending,0),b=loadCourseDetail(pending,0);assert.equal(a,b);
await Promise.all([a,b]);assert.equal(calls,1);
let stage = 0;
globalThis.__resolve = async(r,i,s,p) => {
  stage++;
  const analysis = r.routeAnalysis[0];
  if (stage === 1) {
    p({...analysis,transfers:[{route},{route:{status:'PENDING'}}]});
    throw new Error('network error');
  }
  assert.equal(analysis.transfers[0].route.status,'FOUND');
  p({...analysis,transfers:[{route},{route}]});
};
const recoverable={...pending,routeAnalysis:[{...pending.routeAnalysis[0],transfers:[{route:{status:'PENDING'}},{route:{status:'PENDING'}}]}]};
await assert.rejects(loadCourseDetail(recoverable,0));
await assert.rejects(loadCourseDetail(recoverable,0));
assert.equal(stage,1);
const recovered=await retryCourseDetail(recoverable,0);
assert.equal(stage,2);
assert.ok(recovered.routeAnalysis[0].transfers.every(t=>t.route.status==='FOUND'));
console.log('Saved route roundtrip, deduplication and partial retry checks passed');
