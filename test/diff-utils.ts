// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {describe, it, before} from 'mocha';
import {readFileSync} from 'fs';
import {setup} from './util';
import {resolve} from 'path';
import {parseAllHunks} from '../src/github-handler/diff-utils';
import {expect} from 'chai';

const fixturePath = 'test/fixtures/diffs';

before(() => {
  setup();
});

describe('parseAllHunks', () => {
  it('parses one-to-one hunks', () => {
    const diff = readFileSync(
      resolve(fixturePath, 'one-line-to-one.diff')
    ).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 5,
        oldEnd: 5,
        newStart: 5,
        newEnd: 5,
        newContent: ["  args: ['sleep', '301']"],
        nextLine: "- name: 'ubuntu'",
        previousLine: "- name: 'ubuntu'",
      },
    ]);
  });
  it('parses one-to-many hunks', () => {
    const diff = readFileSync(
      resolve(fixturePath, 'one-line-to-many.diff')
    ).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 7,
        oldEnd: 7,
        newStart: 7,
        newEnd: 8,
        newContent: ["  args: ['foobar']", '  id: asdf'],
        previousLine: "- name: 'ubuntu'",
      },
    ]);
  });
  it('parses one-to-many hunks with a newline added', () => {
    const diff = readFileSync(
      resolve(fixturePath, 'one-line-to-many-newline.diff')
    ).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 5,
        oldEnd: 5,
        newStart: 5,
        newEnd: 6,
        newContent: ["  args: ['sleep', '30']", "  id: 'foobar'"],
        previousLine: "- name: 'ubuntu'",
      },
    ]);
  });
  it('parses many-to-many-hunks', () => {
    const diff = readFileSync(
      resolve(fixturePath, 'many-to-many.diff')
    ).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 2,
        oldEnd: 5,
        newStart: 2,
        newEnd: 3,
        newContent: ["- name: 'foo'", "  args: ['sleep 1']"],
        nextLine: "- name: 'ubuntu'",
        previousLine: 'steps:',
      },
    ]);
  });

  it('parses many-to-one-hunks', () => {
    const diff = readFileSync(
      resolve(fixturePath, 'many-to-one.diff')
    ).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 2,
        oldEnd: 5,
        newStart: 2,
        newEnd: 2,
        newContent: ["- name: 'foo'"],
        nextLine: "- name: 'ubuntu'",
        previousLine: 'steps:',
      },
    ]);
  });
  it('parses deletions', () => {
    const diff = readFileSync(resolve(fixturePath, 'deletion.diff')).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 4,
        oldEnd: 5,
        newStart: 4,
        newEnd: 3,
        newContent: [],
        nextLine: "- name: 'ubuntu'",
        previousLine: "  args: ['echo', 'foobar']",
      },
    ]);
  });
  it('parses additions', () => {
    const diff = readFileSync(resolve(fixturePath, 'addition.diff')).toString();
    const allHunks = parseAllHunks(diff);
    expect(allHunks.size).to.equal(1);
    const hunks = allHunks.get('cloudbuild.yaml');
    expect(hunks).to.eql([
      {
        oldStart: 6,
        oldEnd: 5,
        newStart: 6,
        newEnd: 6,
        newContent: ["  id: 'added'"],
        nextLine: "- name: 'ubuntu'",
        previousLine: "  args: ['sleep', '30']",
      },
    ]);
  });
});
