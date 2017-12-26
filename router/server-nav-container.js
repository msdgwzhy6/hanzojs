import React from 'react'
import PropTypes from 'prop-types'
import { NavigationActions, addNavigationHelpers } from 'react-navigation'

module.exports = (NodeRuntimeNavView, matchToRoute) => {
  class NavigationContainer extends React.Component {
    constructor (props) {
      super(props)
      const navigation = this.props.navigation;
      const state = navigation.state;
      const navigation2 = addNavigationHelpers({
        state: state.routes[state.index],
        dispatch: navigation.dispatch,
      });
      const options =  NodeRuntimeNavView.router.getScreenOptions(navigation2);
      matchToRoute && matchToRoute(options);
    }
    render() {
      return (
        <NodeRuntimeNavView
          navigation={this.props.navigation}
        />
      );
    }
    getURIForAction = action => {
      const state =
        NodeRuntimeNavView.router.getStateForAction(action, this.state) ||
        this.state;
      const { path } = NodeRuntimeNavView.router.getPathAndParamsForState(
        state
      );
      return `/${path}`;
    };
    getActionForPathAndParams = (path, params) => {
      return NodeRuntimeNavView.router.getActionForPathAndParams(path, params);
    };
    static childContextTypes = {
      getActionForPathAndParams: PropTypes.func.isRequired,
      getURIForAction: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
    };
    getChildContext() {
      return {
        getActionForPathAndParams: this.getActionForPathAndParams,
        getURIForAction: this.getURIForAction,
        dispatch: this.props.navigation.dispatch,
      };
    }
  }
  return NavigationContainer
}
