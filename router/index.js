import React, { PropTypes } from 'react'
import { render } from 'react-dom'
import { Dimensions, Animated, Easing, StyleSheet, View, Image } from "react-native";
import BrowserNavContainer from "./browser-nav-container";
import ServerNavContainer from "./server-nav-container";
import Navigation, { addNavigationHelpers } from 'react-navigation/lib/react-navigation.web.js'

let reactAppContext = {};
let onProcessing = null;
let onProcessed = null;
let isNodeRuntime = false
let matchToRoute

const isFunction = (handle) => (typeof handle === 'function');
const AnimateValue = (v) => new Animated.Value(v);

/**
 * 简单实现切换路由时页面切换，以后这里可以写个动画进行页面切换
 */
class NavAnimateView extends React.PureComponent {

  static propTypes = {
    route: PropTypes.string,
    isForward: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
  * 初始化动画参数
  */
  initAnimation(isForward) {
    const screenWidth = Dimensions.get('window').width;
    this.beginX = 0;
    this.endX = isForward ? screenWidth : -screenWidth;
    this.translateX = AnimateValue(0);
    this.translateZ = AnimateValue(0);
    //注册的动画
    this.createAnimations = {
      getInAnimate: this.inAnimation.bind(this),
      getOutAnimate: this.outAnimation.bind(this),
    }
  }

  /**
  * 获取进入页面动画样式
  */
  getPageInStyle(isForward) {
    let animateStyle = { backfaceVisibility: 'hidden' }
    let transXInterpolate = this.translateX.interpolate({
      inputRange: [0, 1],
      outputRange: [this.endX, this.beginX]
    });
    animateStyle.transform = [{ translate3d: '0,0,0' }, { translateX: transXInterpolate }];
    return animateStyle;
  }

  /**
   * 初始化进入页面动画样式
   */
  getPageOutStyle(state) {
    let outStyle = { backfaceVisibility: 'hidden' }
    let transZInterpolate = this.translateZ.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -300]
    });
    outStyle.transform = [{ translate3d: '0,0,0' }, { translateZ: transZInterpolate }];
    return outStyle;
  }

  /**
   * 播放动画
   */
  playAnimation() {
    this.createAnimations.getInAnimate().start();
    if (this.state.lastChildren) {
      this.createAnimations.getOutAnimate().start(() => {
        this.setState({ lastChildren: undefined })
      });
    }
  }

  inAnimation() {
    return Animated.timing(this.translateX, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.ease) });
  }

  outAnimation() {
    return Animated.timing(this.translateZ, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.ease) });
  }

  _shouldSetResponder() {
    return true;
  }

  /**
   * 当属性改变时,切换窗口样式
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.route !== this.props.route) {
      this.initAnimation(nextProps.isForward);
      this.setState({
        lastChildren: this.props.children,
        initStyle: this.getPageInStyle(),
        outStyle: this.getPageOutStyle()
      })
    }
  }

  /**
 * 当属性改变时,切换窗口样式
 */
  componentDidUpdate(nextProps) {
    this.playAnimation();
  }

  /**
   * 渲染切换前的视图
   */
  renderPrev() {
    let { lastChildren } = this.state;
    if (lastChildren) {
      return (
        <Animated.View style={[styles.nav, this.state.outStyle]} onStartShouldSetResponder={this._shouldSetResponder.bind(this)}>
          {lastChildren}
        </Animated.View>
      )
    }
  }

  /**
   * 渲染组件
   */
  render() {
    return (
      <View style={styles.container}>
        {this.renderPrev()}
        <Animated.View style={[styles.nav, this.state.initStyle]} onStartShouldSetResponder={this._shouldSetResponder.bind(this)}>
          {this.props.children}
        </Animated.View>
      </View>
    );
  }
}


class NavView extends React.Component {

  /**
   * 组件构造函数
   * @param props {Object} 组件props
   */
  constructor(props) {
    super(props);
    this.routeComponent = this.props;
    //设置默认state
    this.state = {
      //需要渲染的组件
      requiredComponent: this.isAsyncComponent ? null : this.routeComponent
    }
  }

  /**
   * 当前路由需要展示的组件
   */
  get routeComponent() {
    return this._routeComponent;
  }

  /**
   * 设置当前路由需要展示的组件
   */
  set routeComponent(props) {
    const { navigation, router } = props;
    const { state } = navigation;
    this._routeComponent = router.getComponentForState(state);
  }

  /**
   * 判断当前props.asyncComponent 是否为一个异步加载组件
   * 而不是纯粹的React组件
   */
  get isAsyncComponent() {
    let asyncComponent = this.routeComponent;
    return !(asyncComponent instanceof React.Component || this.isReduxConnect) && isFunction(asyncComponent)
  }

  /**
   * 判断是否为一个redux的connect
   */
  get isReduxConnect() {
    let asyncComponent = this.routeComponent;
    return isFunction(asyncComponent) && (asyncComponent.prototype instanceof React.Component);
  }

  /**
   * 组件第一次渲染完成时，执行一次异步获取
   */
  componentDidMount() {
    this.asyncRequireComponent();
  }

  /**
   * 当路由切换时
   * @param nextProps {Object} 新的props
   */
  componentWillReceiveProps(nextProps) {
    this.state.requiredComponent = null;
    this.routeComponent = nextProps;
    this.asyncRequireComponent();
  }

  /**
   * 仅在requiredComponent变更时，才刷新组件内容
   * @param nextProps {Object} 新的props
   * @param nextState {Object} 新的state
   * @returns {Boolean} 
   */
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.requiredComponent && nextState.requiredComponent.prototype instanceof React.Component;
  }

  /**
   * 尝试异步方式获取要显示的组件
   */
  asyncRequireComponent() {
    if (this.isAsyncComponent) {
      this.state.requiredComponent = null;
      this.onProcessing();
      //异步加载组件，然后进行渲染
      this.routeComponent().then((m) => {
        let requiredComponent = (m.default || m);
        this.setState({ requiredComponent });
        this.onProcessed();
      }).catch((ex) => {
        console.error(ex);
      })
    } else if (this.routeComponent !== this.state.requiredComponent) {
      //如果传入的是同步组件
      let requiredComponent = this.routeComponent;
      this.setState({ requiredComponent });
    }
  }

  /**
   * 异步组件请求中，可以在次函数中添加loaing效果
   */
  onProcessing() {
    if (isFunction(onProcessing)) {
      onProcessing();
    } else {
      Processing.show();
    }
  }

  /**
   * 异步组件请求完毕
   */
  onProcessed() {
    if (isFunction(onProcessed)) {
      onProcessed();
    } else {
      Processing.hide();
    }
  }

  /**
   * 组件渲染
   */
  render() {
    const Component = this.state.requiredComponent;
    const { navigation, router, isForward } = this.props;
    const state = navigation.state;
    const { path } = router.getPathAndParamsForState(state);
    const forward = isForward || false;
    return (
      <NavAnimateView route={path} isForward={forward}>
        <Component
          navigation={addNavigationHelpers({
            ...navigation,
            state: state.routes[state.index],
          })}
        />
      </NavAnimateView>
    );
  }
}

class Processing {

  static show() {
    this.timer = setTimeout(() => this.preloader(), 200)
  }

  static preloader() {
    let container = this.container = document.createElement('div');
    container.innerHTML = `
      <style type="text/css">
        .preloader-indicator-overlay {
            visibility: visible;
            opacity: 0;
            background: 0 0
        }
        .preloader-indicator-modal {
            position: absolute;
            left: 50%;
            top: 50%;
            background: rgba(0,0,0,.8);
            margin-left:-30px;
            margin-top:-30px;
            z-index: 11000;
            padding:10px;
            border-radius: 4px;
        }
        .preloader-indicator-modal .preloader {
            display: block;
            width: 40px;
            height: 40px;
             -webkit-transform-origin: 50%;
            transform-origin: 50%;
            -webkit-animation: preloader-spin 1s steps(12,end) infinite;
            animation: preloader-spin 1s steps(12,end) infinite
        }
        .preloader:after {
            display: block;
            content: "";
            width: 100%;
            height: 100%;
            background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%23fff'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
            background-position: 50%;
            background-size: 100%;
            background-repeat: no-repeat
        }
        @-webkit-keyframes preloader-spin {
            100% {
                -webkit-transform: rotate(360deg)
            }
        }
        @keyframes preloader-spin {
            100% {
                -webkit-transform: rotate(360deg);
                transform: rotate(360deg)
            }
        }
      </style>
      <div class="preloader-indicator-overlay"></div>
      <div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>
     `;
    document.body.appendChild(container);
  }

  static hide() {
    clearTimeout(this.timer);
    if (this.container) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}

/**
 * 由于react-navigation 在web平台下只能使用TabRouter以及StackRouter 
 * 这里为了统一风格，追加StackNavigator 
 * 用于兼容web平台路由定义，并且根据运行环境(客户端/服务端)
 * 返回对应的Navigator
 * 服务端：createNavigator
 * 客户端:BrowserNavContainer(createNavigator(...)) 模式
 * BrowserNavContainer：用于实现客户端采用pushState切换页面，
 *                      完成同构衔接(既可以客户端跳转(pushState)也可以刷新浏览器服务器渲染)
 */
Navigation.StackNavigator = (routeConfigs, stackConfig) => {
  let { TabRouter, createNavigator } = Navigation;
  let navigator = createNavigator(TabRouter(routeConfigs, stackConfig))(NavView);
  let { router } = navigator;
  let NavContainer = isNodeRuntime ? ServerNavContainer : BrowserNavContainer;
  navigator = NavContainer(navigator, matchToRoute);
  navigator.router = router;
  navigator.initialRouteName = reactAppContext.route;
  return navigator;
}

Navigation.setConfig = function (config) {
  reactAppContext = config.reactAppContext
  isNodeRuntime = config.isNodeRuntime
  matchToRoute = config.matchToRoute
  onProcessing = config.onProcessing;
  onProcessed = config.onProcessed;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    transform: [{ translate3d: '0,0,0' }],
    backfaceVisibility: 'hidden',
    perspective: 1000
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: '#fff',
  }
});

export default module.exports = Navigation;