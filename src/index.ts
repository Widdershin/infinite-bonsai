import { makeDOMDriver, DOMSource, div } from '@cycle/dom';
import { timeDriver, TimeSource } from '@cycle/time';
import { run } from '@cycle/run';
import xs from 'xstream';

interface Sources {
  DOM: DOMSource;
  Time: TimeSource;
}

function main(sources: Sources) {
  return {
    DOM: xs.of(div('hello world'))
  };
}

const drivers = {
  DOM: makeDOMDriver(document.body),
  Time: timeDriver
};

run(main, drivers);
