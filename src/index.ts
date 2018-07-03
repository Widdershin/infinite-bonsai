import { makeDOMDriver, DOMSource, VNode, div } from '@cycle/dom';
import { timeDriver, TimeSource } from '@cycle/time';
import { run } from '@cycle/run';
import xs, {MemoryStream} from 'xstream';
var toHTML = require('snabbdom-to-html')

interface Sources {
  DOM: DOMSource;
  Time: TimeSource;
}

const graph = {
  nodes: {
    0: { id: 0, value: 'select("button")' },
    1: { id: 1, value: 'events("click")' },
    2: { id: 2, value: 'mapTo(+1)' },
    3: { id: 3, value: 'fold((acc, val) => acc + val, 0)' },
    4: { id: 4, value: 'map(view)' },
    5: { id: 5, value: 'DOM.driver' }
  },

  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 0 }
  ]
};

interface State {
  graph: Graph;
}

interface Graph {
  nodes: {
    [id: number]: { id: number; value: string };
  };
  edges: Edge[];
}

interface Edge {
  from: number;
  to: number;
}

const initialState: State = { graph };

const values = <T>(obj: { [key: string]: T }): T[] =>
  Object.keys(obj).map(k => obj[k]);

function view(state: State): VNode {
  return div(
    '.bonsai',
    values(state.graph.nodes).map(node => div('.node', (node as any).value))
  );
}

function main(sources: Sources) {
  const state$ = xs.of(initialState);

  return {
    Wat: state$.map(view)
  };
}

var DOMURL = window.URL || window;

function makeSVG(el: string) {
  var data =
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
    '<foreignObject width="100%" height="100%">' +
    el +
    '</foreignObject>' +
    '</svg>';

  const blob = new Blob([data], {type: 'image/svg+xml'});

  const url = DOMURL.createObjectURL(blob);

  const image = new Image();

  image.src = url;

  return image;
}

function watDriver(sink$: MemoryStream<VNode>) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.appendChild(canvas);

  sink$.addListener({
    next(vnode: VNode) {
      if (typeof vnode.data !== "object") {
        vnode.data = {};
      }
      if (typeof vnode.data.attrs !== "object") {
        vnode.data.attrs = {};
      }

      vnode.data.attrs.xmlns = "http://www.w3.org/1999/xhtml";

      const html = toHTML(vnode);
      const image = makeSVG(html);

      image.onload = function () {
        div('.test')
        context && context.drawImage(image, 0, 0);
      };
    }
  });
}

const drivers = {
  DOM: makeDOMDriver(document.body),
  Time: timeDriver,
  Wat: watDriver
};

run(main, drivers);
