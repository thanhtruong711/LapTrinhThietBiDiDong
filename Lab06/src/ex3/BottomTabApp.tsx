
import React, { useState } from "react";
import {
  FlatList,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { PHONES } from "../data/phones";
import { colors } from "../theme";

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<
  keyof TabParamList,
  [
    keyof typeof Ionicons.glyphMap,
    keyof typeof Ionicons.glyphMap
  ]
> = {
  Home: ["home", "home-outline"],
  Search: ["search", "search-outline"],
  Profile: ["person", "person-outline"],
};

function HomeTab() {
  return (
    <FlatList
      data={PHONES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.phoneName}>
            {item.name.split(" - ")[0]}
          </Text>
          <Text style={styles.price}>
            {item.price.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      )}
    />
  );
}

function SearchTab() {
  const [keyword, setKeyword] = useState("");

  const filteredPhones = PHONES.filter((phone) =>
    phone.name.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  return (
    <View style={styles.searchContainer}>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Nhập từ khóa"
        style={styles.input}
      />

      {filteredPhones.length === 0 ? (
        <Text style={styles.empty}>
          Không có kết quả cho “{keyword}”
        </Text>
      ) : (
        <FlatList
          data={filteredPhones}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.phoneName}>
                {item.name.split(" - ")[0]}
              </Text>
              <Text style={styles.price}>
                {item.price.toLocaleString("vi-VN")} đ
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

function ProfileTab() {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>N</Text>
      </View>

      <Text style={styles.profileName}>Trần Thanh Trường</Text>
      <Text style={styles.email}>tranthanhtruong2k5@gmail.com</Text>
    </View>
  );
}

export function BottomTabApp() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitleAlign: "center",
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={ICONS[route.name][focused ? 0 : 1]}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeTab}
          options={{ title: "Trang chủ" }}
        />
        <Tab.Screen
          name="Search"
          component={SearchTab}
          options={{ title: "Tìm kiếm" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTab}
          options={{ title: "Cá nhân" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  phoneName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  price: {
    marginTop: 8,
    color: colors.red,
    fontSize: 15,
    fontWeight: "bold",
  },
  searchContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 16,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: colors.muted,
    fontSize: 15,
  },
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.blue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 23,
    fontWeight: "bold",
    color: colors.text,
  },
  email: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 6,
  },
});
