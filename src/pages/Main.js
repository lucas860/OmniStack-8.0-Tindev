import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from 'react-native';

import api from '../services/api';

import logo from '../assets/logo.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
  const id = navigation.getParam('user');
  const [users, setUsers] = useState([]);
  const [matchUser, setMatchUser] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      const response = await api.get('/users', {
        headers: {
          user: id,
        }
      })

      setUsers(response.data);
    }

    loadUsers();
  }, [id]);

  useEffect(() => {
    const socket = io('http://localhost:3333', {
        query: { user: id }
    });

    socket.on('match', user => {
        setMatchUser(user);
    });
  }, [id]);

  async function handleLike() {
    const [user, ...rest] = users;

    await api.post(`/user/${user._id}/like`, null, {
      headers: { user: id },
    })

    setUsers(rest);
  }

  async function handleDislike() {
    const [user, ...rest] = users;

    await api.post(`/user/${user._id}/dislike`, null, {
      headers: { user: id },
    })

    setUsers(rest);
  }

  async function handleLogout() {
    await AsyncStorage.clear();

    navigation.navigate('Login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleLogout}>
        <Image style={styles.logo} source={logo} />
      </TouchableOpacity>

      <View style={styles.cardsContainer}>
        { users.length === 0
          ? <Text style={styles.empty}>Acabou :(</Text>
          : (
            users.map((user, index) => (
              <View key={user._id} style={[styles.card, { zIndex: users.length - index }]}>
                <Image style={styles.avatar} source={{ uri: user.avatar }} />
                <View style={styles.footer}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>
                </View>
              </View>
            ))
          )}
      </View>

      { users.length > 0 && (
        <View style={[styles.buttonsContainer, { zIndex: 0 }]}>
          <TouchableOpacity style={styles.button} onPress={handleDislike}>
            <Image source={dislike} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLike}>
            <Image source={like} />
          </TouchableOpacity>
        </View>
      ) }

      { matchUser && (
        <View style={[styles.matchContainer, { zIndex: 1 + users.length }]}>
          <Image style={styles.matchImage} source={itsamatch}/>
          <Image source={{ uri: matchUser.avatar }} style={styles.matchAvatar}/>
          <Text style={styles.matchName}>{matchUser.name}</Text>
          <Text style={styles.matchBio}>{matchUser.bio}</Text>

          <TouchableOpacity onPress={() => setMatchUser(null)}>
            <Text style={styles.matchButton}>FECHAR</Text>
          </TouchableOpacity>
        </View>
      ) }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  logo: {
    marginTop: 30,
  },

  empty: {
    alignSelf: 'center',
    color: '#999',
    fontSize: 24,
    fontWeight: 'bold'
  },

  cardsContainer: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    maxHeight: 500,
  },

  card: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    margin: 30,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  avatar: {
    flex: 1,
    height: 300,
  },

  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },

  bio: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    lineHeight: 18
  },

  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },

  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  matchContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  matchImage: {
    height: 60,
    resizeMode: 'contain'
  },

  matchAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: '#FFF',
    borderWidth: 5,
    marginVertical: 30
  },

  matchName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },

  matchBio: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 400,
    color: 'rgba(210, 210, 210, 0.8)',
    paddingHorizontal: 30
  },

  matchButton: {
    borderWidth: 0,
    fontWeight: 'bold',
    color: '#FFF',
    fontSize: 16,
    marginTop: 20
  },
});
