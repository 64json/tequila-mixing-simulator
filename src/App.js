import React, { Component } from 'react';
import './App.css';

const colorOrange = { r: 253, g: 192, b: 0 };
const colorTequila = { r: 255, g: 255, b: 255 };
const colorSprite = { r: 30, g: 71, b: 130 };

class App extends Component {
  constructor(props) {
    super(props);

    this.solutes = [];
    this.mixtures = [];
    this.tanks = [];
    this.pipes = [];
    this.tempPipe = null;
    this.t = 0;
    this.timer = null;
  }

  componentDidMount() {
    const gapH4 = window.innerWidth / 4;
    const gapH3 = window.innerWidth / 3;
    const gapH2 = window.innerWidth / 2;
    const gapV = window.innerHeight / 3;
    const orange = new Solute('Orange', gapH4, colorOrange);
    const tequila = new Solute('Tequila', gapH4 * 2, colorTequila);
    const sprite = new Solute('Sprite', gapH4 * 3, colorSprite);
    this.solutes = [orange, tequila, sprite];
    const tankA = new Tank('A', gapH3, gapV, {
      O: t => 20 / 3 - 20 / 3 * Math.pow(Math.E, -t),
      S: t => 0,
      T: t => 10 / 3 + 20 / 3 * Math.pow(Math.E, -t),
    });
    const tankB = new Tank('B', gapH3 * 2, gapV, {
      O: t => 0,
      S: t => 5 - 5 * Math.pow(Math.E, -t),
      T: t => 5 + 5 * Math.pow(Math.E, -t),
    });
    const tankC = new Tank('C', gapH3, gapV * 2, {
      O: t => 4 + 2 * Math.pow(Math.E, -1 / 10 * t) - 6 * Math.pow(Math.E, -1 / 2 * t),
      S: t => 2 - 2 * Math.pow(Math.E, -1 / 10 * t),
      T: t => 4 + 6 * Math.pow(Math.E, -1 / 2 * t),
    });
    const tankD = new Tank('D', gapH3 * 2, gapV * 2, {
      O: t => 4 - 4 * Math.pow(Math.E, -1 / 10 * t),
      S: t => 2 + 4 * Math.pow(Math.E, -1 / 10 * t) - 6 * Math.pow(Math.E, -1 / 2 * t),
      T: t => 4 + 6 * Math.pow(Math.E, -1 / 2 * t),
    });
    this.tanks = [tankA, tankB, tankC, tankD];
    const mixture = new Mixture('Mixture', gapH2, {
      O: t => 4 - 4 * Math.pow(Math.E, -1 / 10 * t),
      S: t => 2 + 4 * Math.pow(Math.E, -1 / 10 * t) - 6 * Math.pow(Math.E, -1 / 2 * t),
      T: t => 4 + 6 * Math.pow(Math.E, -1 / 2 * t),
    });
    this.mixtures = [mixture];
    this.pipes = [
      new Pipe(orange, tankA, .2),
      new Pipe(tequila, tankA, .1),
      new Pipe(tequila, tankB, .1),
      new Pipe(sprite, tankB, .1),
      new Pipe(tankA, tankC, .3),
      new Pipe(tankB, tankD, .2),
      new Pipe(tankC, tankD, .1),
      new Pipe(tankD, tankC, .3),
      new Pipe(tankC, mixture, .5),
    ];
    this.forceUpdate();
  }

  createSolute(e) {
    const { clientX: x } = e;
    const name = `Solute ${this.solutes.length + 1}`;
    const solute = new Solute(name, x);
    this.solutes.push(solute);
    this.forceUpdate();
  }

  updateSolute(solute, update) {
    Object.assign(solute, update);
    this.forceUpdate();
  }

  createTank(e) {
    const { clientX: x, clientY: y } = e;
    const name = `Tank ${this.tanks.length + 1}`;
    const tank = new Tank(name, x, y);
    this.tanks.push(tank);
    this.forceUpdate();
  }

  updateTank(tank, update) {
    Object.assign(tank, update);
    this.forceUpdate();
  }

  createMixture(e) {
    const { clientX: x } = e;
    const name = `Mixture ${this.mixtures.length + 1}`;
    const mixture = new Mixture(name, x);
    this.mixtures.push(mixture);
    this.forceUpdate();
  }

  updateMixture(mixture, update) {
    Object.assign(mixture, update);
    this.forceUpdate();
  }

  createTempPipe(e, from) {
    e.stopPropagation();
    const { clientX: x, clientY: y } = e;
    this.tempPipe = { from, x, y };
    this.forceUpdate();
  }

  updateTempPipe(e) {
    if (this.tempPipe) {
      const { clientX: x, clientY: y } = e;
      Object.assign(this.tempPipe, { x, y });
      this.forceUpdate();
    }
  }

  removeTempPipe(e) {
    if (this.tempPipe) {
      this.tempPipe = null;
      this.forceUpdate();
    }
  }

  createPipe(e, to) {
    if (this.tempPipe) {
      const { from } = this.tempPipe;
      if (from !== to) {
        this.pipes.push(new Pipe(from, to));
      }
      this.tempPipe = null;
      this.forceUpdate();
    }
  }

  updatePipe(pipe, update) {
    Object.assign(pipe, update);
    this.forceUpdate();
  }

  getStyle({ r, g, b }) {
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  getPosition(from, to, padding) {
    let { x: sx, y: sy } = from;
    let { x: ex, y: ey } = to;
    const angle = Math.atan2(ey - sy, ex - sx) - Math.PI / 2;
    const dx = padding * Math.cos(angle);
    const dy = padding * Math.sin(angle);
    sx += dx;
    sy += dy;
    ex += dx;
    ey += dy;
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    return {
      sx, sy,
      ex, ey,
      mx, my
    };
  }

  calculate() {
    /*    for (const solute of this.solutes) {
          const N = this.tanks.length;
          const A = Array(N).fill(0);
          const B = Array(N).fill(0);
          for (let i = 0; i < N; i++) {
            A[i] = Array(N).fill(0);
            const tank = this.tanks[i];
            const inPipes = this.pipes.filter(pipe => pipe.to === tank);
            const outPipes = this.pipes.filter(pipe => pipe.from === tank);
            inPipes.forEach(pipe => {
              const { from } = pipe;
              if (from instanceof Solute) {
                if (from === solute) {
                  B[i] += pipe.rate * from.conc / 100;
                }
              } else {
                const j = this.tanks.indexOf(from);
                A[i][j] += pipe.rate / from.amount;
              }
            });
            outPipes.forEach(pipe => {
              A[i][i] -= pipe.rate / tank.amount;
            });
          }*/
    const N = 2;
    const A = [[-7, -3], [6, 2]];
    const F = [1, 0];
    const { numeric } = window;
    const { lambda: { x: eigenvalues }, E: { x: eigenvectors } } = numeric.eig(A);
    const M = t => {
      const matrix = Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        matrix[i] = Array(N).fill(0);
        for (let j = 0; j < N; j++) {
          matrix[i][j] = eigenvectors[j][i] * Math.pow(Math.E, eigenvalues[j] * t);
        }
      }
      return matrix;
    };
    console.log({
      eigenvalues,
      eigenvectors,
      funcs: M,
    });
    //}
  }

  animate() {
    this.t = 0;
    this.timer = window.setInterval(() => {
      this.t += .1;
      this.forceUpdate();
    }, 100);
  }

  render() {
    return (
      <div className="app" onMouseMove={e => this.updateTempPipe(e)} onMouseUp={e => this.removeTempPipe(e)}>
        <svg width="100%" height="100%" className="background">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="1" orient="auto"
                    markerUnits="strokeWidth">
              <path className="arrow" d="M0,0 L0,2 L3,1 z" />
            </marker>
          </defs>
          {
            this.tempPipe && (
              <line className="line" x1={this.tempPipe.from.x} y1={this.tempPipe.from.y} x2={this.tempPipe.x}
                    y2={this.tempPipe.y} markerEnd="url(#arrow)" />
            )
          }
          {
            this.pipes.map(pipe => {
              const { sx, sy, ex, ey, mx, my } = this.getPosition(pipe.from, pipe.to, 20);
              const key = `${pipe.from.name}:${pipe.to.name}`;
              return [
                <line key={`${key}-1`} className="line" x1={sx} y1={sy}
                      x2={mx} y2={my} />,
                <line key={`${key}-2`} className="line" x1={mx} y1={my}
                      x2={ex} y2={ey} markerStart="url(#arrow)" />
              ];
            })
          }
        </svg>
        <div className="overlay">
          <div className="solute_container" onMouseDown={e => this.createSolute(e)}>
            {
              this.solutes.map(solute => (
                <div className="box solute" key={solute.name}
                     style={{ left: solute.x, backgroundColor: this.getStyle(solute.color) }}
                     onMouseDown={e => this.createTempPipe(e, solute)}>
                  <span className="title">
                    {solute.name}
                  </span>
                </div>
              ))
            }
          </div>
          <div className="tank_container" onMouseDown={e => this.createTank(e)}>
            {
              this.tanks.map(tank => {
                const { O, S, T } = tank;
                const o = O(this.t) / 10;
                const s = S(this.t) / 10;
                const t = T(this.t) / 10;
                const color = {
                  r: colorOrange.r * o + colorSprite.r * s + colorTequila.r * t,
                  g: colorOrange.g * o + colorSprite.g * s + colorTequila.g * t,
                  b: colorOrange.b * o + colorSprite.b * s + colorTequila.b * t,
                };
                return (
                  <div className="box tank" key={tank.name}
                       style={{ left: tank.x, top: tank.y, backgroundColor: this.getStyle(color) }}
                       onMouseDown={e => this.createTempPipe(e, tank)}
                       onMouseUp={e => this.createPipe(e, tank)}>
                  <span className="title">
                    {tank.name} (10L)
                  </span>
                    <div className="row orange">
                      O ({(o * 100).toFixed(2)}%)
                    </div>
                    <div className="row sprite">
                      S ({(s * 100).toFixed(2)}%)
                    </div>
                    <div className="row tequila">
                      T ({(t * 100).toFixed(2)}%)
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="mixture_container" onMouseDown={e => this.createMixture(e)}>
            {
              this.mixtures.map(mixture => {
                const { O, S, T } = mixture;
                const o = O(this.t) / 10;
                const s = S(this.t) / 10;
                const t = T(this.t) / 10;
                const color = {
                  r: colorOrange.r * o + colorSprite.r * s + colorTequila.r * t,
                  g: colorOrange.g * o + colorSprite.g * s + colorTequila.g * t,
                  b: colorOrange.b * o + colorSprite.b * s + colorTequila.b * t,
                };
                return (
                  <div className="box mixture" key={mixture.name}
                       style={{ left: mixture.x, backgroundColor: this.getStyle(color) }}
                       onMouseDown={e => e.stopPropagation()}
                       onMouseUp={e => this.createPipe(e, mixture)}>
                  <span className="title">
                    {mixture.name}
                  </span>
                    <div className="row orange">
                      O ({(o * 100).toFixed(2)}%)
                    </div>
                    <div className="row sprite">
                      S ({(s * 100).toFixed(2)}%)
                    </div>
                    <div className="row tequila">
                      T ({(t * 100).toFixed(2)}%)
                    </div>
                  </div>
                );
              })
            }
          </div>
          <div className="foreground">
            <div className="controller">
              <button onClick={() => this.animate()}>Animate</button>
            </div>
            {
              this.pipes.map(pipe => {
                const { mx, my } = this.getPosition(pipe.from, pipe.to, 60);
                return (
                  <div key={`${pipe.from.name}:${pipe.to.name}`} className="pipe" style={{ left: mx, top: my }}>
                    <span className="row">
                      {pipe.rate * 1000} mL/s
                    </span>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

class Solute {
  constructor(name, x, color) {
    this.conc = 100;
    this.name = name;
    this.x = x;
    this.y = 60;
    this.color = color;
  }
}

class Mixture {
  constructor(name, x, { O, S, T }) {
    this.name = name;
    this.x = x;
    this.y = window.innerHeight - 60;
    this.O = O;
    this.S = S;
    this.T = T;
  }
}

class Tank {
  constructor(name, x, y, { O, S, T }) {
    this.amount = 100;
    this.name = name;
    this.x = x;
    this.y = y;
    this.O = O;
    this.S = S;
    this.T = T;
  }
}

class Pipe {
  constructor(from, to, rate) {
    this.from = from;
    this.to = to;
    this.rate = rate;
  }
}

export default App;
