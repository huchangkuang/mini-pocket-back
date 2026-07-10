import React from "react";
import { Image, ScrollView, Text, View } from "@tarojs/components";
import logo from "@/images/logo.svg";
import { VISION_QUOTE } from "@/pages/about/constants";
import "./index.scss";

const About: React.FC = () => {
  return (
    <View className="aboutPage">
      <ScrollView scrollY className="aboutPage__scroll">
        <View className="aboutPage__content">
          <View className="aboutPage__brand">
            <View className="aboutPage__logoWrap">
              <View className="aboutPage__logoShadow" />
              <View className="aboutPage__logoBox">
                <Image
                  className="aboutPage__logo"
                  src={logo}
                  mode="aspectFit"
                />
              </View>
            </View>
            <Text className="aboutPage__appName">百宝口袋工坊</Text>
          </View>

          <View className="aboutPage__vision">
            <Text className="aboutPage__visionText">"{VISION_QUOTE}"</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default About;
