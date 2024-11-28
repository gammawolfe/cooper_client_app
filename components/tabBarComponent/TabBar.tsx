import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather, FontAwesome, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import trends from "@/app/(tabs)/trends";

type TabBarProps = BottomTabBarProps;

const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const icons: { [key: string]: (props: any) => JSX.Element } = {
    home: (props) => (
      <Feather name="home" size={24} color="#F3EFE0" {...props} />
    ),
    payments: (props) => (
      <MaterialCommunityIcons name="repeat" size={26} color="#F3EFE0" {...props} />
    ),
    profile: (props) => (
      <FontAwesome name="user-circle-o" size={24} color="#F3EFE0" {...props} />
    ),
    trends: (props) => (
      <Octicons name="graph" size={24} color="#F3EFE0" {...props} />
    ),
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        if (
          [
            "_sitemap",
            "_notFound",
            "wallets",
            "pots",
            "explore",
            "faq",
            "request",
            "contactSupport",
            "terms",
            "notifications",
            "contributions",
            "invitecontacts",
            "privacy",
            "guideLines",
            "loans",
            "pay-friend",
          ].includes(route.name)
        )
          return null; // Exclude wallets, pots, and explore routes

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const Icon = icons[route.name] || ((props) => <Feather name="home" size={24} color="black" {...props}/>);

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.title}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            <Icon color={isFocused ? "#F3EFE0" : "#222"} />
            {typeof label === "string" && (
              <Text style={{ color: isFocused ? "#F3EFE0" : "#222", fontSize: 12 }}>
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#6759AC",
    padding: 10,
    position: "absolute",
    bottom: 25,
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
