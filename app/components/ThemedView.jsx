import React from 'react';
import { View, StyleSheet } from 'react-native';

const ThemedView = ({ children, style, ...props }) => {
    return (
        <View style={[styles.view, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    view: {
        backgroundColor: '#222',
    },
});

export default ThemedView; 