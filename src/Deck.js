import React, { Component } from 'react';
import { View, Animated, StyleSheet, PanResponder, Dimensions, UIManager, LayoutAnimation } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
    LayoutAnimation.spring()
  }

  constructor(props) {
    super(props);
    const position = new Animated.ValueXY()
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy })
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log('swipe right!');
          this.forceSwipe('right')
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left')
        } else {
          this.resetPosition()
        }
      }
    });
    this.state = { panResponder, position, index: 0 };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
      console.log('call receivev props la')
      this.setState({
        index: 0
      })
    }
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction))
  }
  
  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight } = this.props;
    const item = this.props.data[this.state.index];


    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 })
    this.setState({ index: this.state.index + 1 })

  }

  resetPosition() {
    Animated.spring(this.state.position, 
      { toValue: { x:0, y: 0 } 
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    })
    
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    }
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCard()
    }
    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        return null
      }
      
      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }

      return (
        <Animated.View 
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}>
          {this.props.renderCard(item)}
        >
        </Animated.View>
      )
    }).reverse()
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  cardStyle: {
    width: SCREEN_WIDTH, 
    position: 'absolute'
  }
})
                                                                                                                
export default Deck;