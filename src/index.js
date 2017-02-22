import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './rx-scroll-list.scss';

const PULL_DOWN = 'PULL_DOWN';
const PULL_UP = 'PULL_UP';
const REFRESHING = 'REFRESHING';

export default class Scroller extends Component {

  static propTypes = {
    offset: PropTypes.number,
    onRefresh: PropTypes.func,
    onInfinite: PropTypes.func,
    upText: PropTypes.string,
    downText: PropTypes.string,
    refreshText: PropTypes.string,
    infiniteText: PropTypes.string,
  };

  static defaultProps = {
    offset: 44,
    onRefresh: undefined,
    onInfinite: undefined,
    upText: '释放即刷新',
    downText: '下拉可刷新',
    refreshText: '刷新中...',
    infiniteText: '正在加载...',
  };

  constructor(props) {
    super(props);
    this.state = {
      top: 0,
      refreshState: PULL_DOWN,
      startY: 0,
      isInfinite: false,
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.scrolling = this.scrolling.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onRefreshDone = this.onRefreshDone.bind(this);
    this.infinite = this.infinite.bind(this);
    this.onInfiniteDone = this.onInfiniteDone.bind(this);
  }

  render() {
    const { downText, upText, refreshText, infiniteText } = this.props;
    const { refreshState, top } = this.state;
    const mapState2Class = classnames({
      'pull-down': refreshState === PULL_DOWN,
      'pull-up': refreshState === PULL_UP,
      refreshing: refreshState === REFRESHING,
    });
    const translateStyle = {
      transform: `translate3d(0, ${top}px, 0)`,
      '-webkit-transform': `translate3d(0, ${top}px, 0)`,
    };
    const infiniteStyle = {
      display: this.state.isInfinite ? 'block' : 'none',
    };
    return (
      <div
        className={`scroll-list ${mapState2Class}`}
        onTouchStart={this.touchStart}
        onTouchMove={this.touchMove}
        onTouchEnd={this.touchEnd}
        onScroll={this.scrolling}
      >
        <div style={translateStyle} ref="inner" className="scroll-inner">
          <div className="refresh-layer" ref="refreshLayer">
            <div className="text-down"><i className="arrow-down" />{downText}</div>
            <div className="text-up"><i className="arrow-up" />{upText}</div>
            <div className="text-refresh"><i className="loader" />{refreshText}</div>
          </div>
          <div>{this.props.children}</div>
          <div className="infinite-layer" ref="infiniteLayer">
            <div style={infiniteStyle} className="text-infinite"><i className="loader" />{infiniteText}</div>
          </div>
        </div>
      </div>
    );
  }

  touchMove(evt) {
    evt.persist();
    const { startY, startScroll, refreshState } = this.state;
    const { offset } = this.props;
    const diff = evt.changedTouches[0].pageY - startY - startScroll;
    const dist = diff ** 0.8 + (refreshState === REFRESHING ? offset : 0);
    this.setState({
      top: dist,
    });
    if (this.state.refreshState === REFRESHING) {
      return;
    }
    if (this.state.top < offset) {
      this.setState({
        refreshState: PULL_DOWN,
      });
    } else {
      this.setState({
        refreshState: PULL_UP,
      });
    }
  }

  touchEnd() {
    const { refreshState } = this.state;
    if (refreshState === REFRESHING) return;
    if (refreshState === PULL_UP) {
      this.refresh();
    } else {
      this.setState({
        top: 0,
      });
    }
  }

  scrolling() {
    const { inner, refreshLayer, infiniteLayer } = this.refs;
    const $root = findDOMNode(this);
    const wrapperHeight = $root.clientHeight,
      innerHeight = inner.clientHeight,
      refreshLayerHeight = refreshLayer.clientHeight,
      infiniteLayerHeight = infiniteLayer.clientHeight,
      scrollTop = $root.scrollTop;
    const bottom = innerHeight - wrapperHeight - refreshLayerHeight - scrollTop;
    if (bottom < infiniteLayerHeight) this.infinite(scrollTop);
  }

  refresh() {
    const { offset, onRefresh } = this.props;
    this.setState({
      top: offset,
      refreshState: REFRESHING,
    });
    onRefresh(this.onRefreshDone);
  }

  onRefreshDone() {
    this.setState({
      top: 0,
      refreshState: PULL_DOWN,
    });
  }

  infinite() {
    const { onInfinite } = this.props;
    this.setState({
      isInfinite: true,
    });
    onInfinite(this.onInfiniteDone);
  }

  onInfiniteDone() {
    this.setState({
      isInfinite: false,
    });
  }
  touchStart(evt) {
    evt.persist();
    const $root = findDOMNode(this);
    this.setState({
      startY: evt.changedTouches[0].pageY,
      startScroll: $root.scrollTop || 0,
    });
  }
}
