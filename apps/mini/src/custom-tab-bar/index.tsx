import { Component } from "react";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import BottomNav, { TAB_ROUTES, type TabKey } from "@/components/bottomNav";
import { getActiveKeyFromRoute } from "@/utils/tabBarState";
import "./index.scss";

type CustomTabBarState = {
  active: TabKey;
};

export default class CustomTabBar extends Component<object, CustomTabBarState> {
  state: CustomTabBarState = {
    active: getActiveKeyFromRoute(),
  };

  pageLifetimes = {
    show: () => {
      this.syncSelected();
    },
  };

  componentDidMount() {
    this.syncSelected();
  }

  syncSelected = () => {
    const key = getActiveKeyFromRoute();
    if (key !== this.state.active) {
      this.setState({ active: key });
    }
  };

  setSelected = (key: TabKey) => {
    this.setState({ active: key });
  };

  handleSwitch = (key: TabKey) => {
    if (key === this.state.active) return;
    Taro.switchTab({ url: TAB_ROUTES[key] });
  };

  render() {
    return (
      <View className="customTabBar">
        <BottomNav active={this.state.active} onSwitch={this.handleSwitch} />
      </View>
    );
  }
}
