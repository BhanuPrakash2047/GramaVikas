import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

// ─── Floating Particle ──────────────────────────────────────────
const Particle = ({ delay, startX, startY, size, duration }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.5, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
};

// ─── Main Splash ─────────────────────────────────────────────────
const SplashScreen = () => {
  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Staggered entrance ──
    Animated.sequence([
      // 1. Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // ── Continuous pulse on logo ring ──
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ── Shimmer sweep on title ──
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // ── Loading dots ──
    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 3,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // Particles data
  const particles = [
    { delay: 0, startX: width * 0.1, startY: height * 0.15, size: 8, duration: 2800 },
    { delay: 300, startX: width * 0.75, startY: height * 0.12, size: 6, duration: 3200 },
    { delay: 600, startX: width * 0.5, startY: height * 0.08, size: 10, duration: 2600 },
    { delay: 200, startX: width * 0.85, startY: height * 0.65, size: 7, duration: 3000 },
    { delay: 500, startX: width * 0.15, startY: height * 0.72, size: 9, duration: 2900 },
    { delay: 100, startX: width * 0.6, startY: height * 0.8, size: 5, duration: 3400 },
    { delay: 400, startX: width * 0.35, startY: height * 0.88, size: 8, duration: 2700 },
    { delay: 700, startX: width * 0.9, startY: height * 0.35, size: 6, duration: 3100 },
  ];

  return (
    <View style={styles.container}>
      {/* ── Background gradient layers ── */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* ── Floating particles ── */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* ── Decorative circles ── */}
      <View style={[styles.decoCircle, styles.decoCircle1]} />
      <View style={[styles.decoCircle, styles.decoCircle2]} />
      <View style={[styles.decoCircle, styles.decoCircle3]} />

      {/* ── Center content ── */}
      <View style={styles.center}>
        {/* Pulsing outer ring */}
        <Animated.View
          style={[
            styles.logoRingOuter,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />

        {/* Logo container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoInner}>
            <Ionicons name="leaf" size={48} color={COLORS.white} />
          </View>
        </Animated.View>

        {/* Title with shimmer */}
        <Animated.View
          style={[
            styles.titleWrap,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.titleGram}>Gram</Text>
          <Text style={styles.titleVikash}>Vikash</Text>
          {/* Shimmer overlay */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslateX }] },
            ]}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Empowering Rural India's Growth
        </Animated.Text>

        {/* Decorative divider */}
        <Animated.View style={[styles.divider, { opacity: taglineOpacity }]} />

        {/* Sub-tagline */}
        <Animated.Text style={[styles.subTagline, { opacity: taglineOpacity }]}>
          Smart Agriculture  {'\u2022'}  Government Schemes  {'\u2022'}  Emergency Aid
        </Animated.Text>
      </View>

      {/* ── Loading indicator at bottom ── */}
      <View style={styles.loadingWrap}>
        <LoadingDots anim={dotAnim} />
      </View>

      {/* ── Bottom branding ── */}
      <View style={styles.bottomBrand}>
        <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.5)" />
        <Text style={styles.bottomText}> Secure & Trusted  {'\u2022'}  Made for Farmers</Text>
      </View>
    </View>
  );
};

// ─── Animated Loading Dots ──────────────────────────────────────
const LoadingDots = ({ anim }) => {
  const dot1Opacity = anim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
    outputRange: [0.3, 1, 0.3, 0.3, 0.3, 0.3, 0.3],
  });
  const dot2Opacity = anim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
    outputRange: [0.3, 0.3, 0.3, 1, 0.3, 0.3, 0.3],
  });
  const dot3Opacity = anim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
    outputRange: [0.3, 0.3, 0.3, 0.3, 0.3, 1, 0.3],
  });

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332',
    overflow: 'hidden',
  },

  // ── Gradient-like background layers ──
  bgTop: {
    position: 'absolute',
    top: -height * 0.25,
    left: -width * 0.3,
    width: width * 1.6,
    height: height * 0.6,
    borderRadius: height * 0.3,
    backgroundColor: 'rgba(45,106,79,0.6)',
    transform: [{ rotate: '-12deg' }],
  },
  bgBottom: {
    position: 'absolute',
    bottom: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.4,
    height: height * 0.5,
    borderRadius: height * 0.25,
    backgroundColor: 'rgba(82,183,136,0.15)',
    transform: [{ rotate: '8deg' }],
  },

  // ── Decorative circles ──
  decoCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(183,228,199,0.12)',
    borderRadius: 999,
  },
  decoCircle1: {
    width: 300,
    height: 300,
    top: height * 0.12,
    left: -80,
  },
  decoCircle2: {
    width: 200,
    height: 200,
    top: height * 0.5,
    right: -60,
  },
  decoCircle3: {
    width: 400,
    height: 400,
    bottom: -120,
    left: width * 0.2,
  },

  // ── Floating particles ──
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(183,228,199,0.35)',
  },

  // ── Center content ──
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // ── Logo ──
  logoRingOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(183,228,199,0.2)',
    top: '50%',
    marginTop: -130,
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(82,183,136,0.25)',
    borderWidth: 2.5,
    borderColor: 'rgba(183,228,199,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    // Inner shadow effect
    shadowColor: '#52B788',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },

  // ── Title ──
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    overflow: 'hidden',
  },
  titleGram: {
    fontSize: 38,
    fontWeight: '300',
    color: '#B7E4C7',
    letterSpacing: 1,
  },
  titleVikash: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ skewX: '-20deg' }],
  },

  // ── Tagline ──
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B7E4C7',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },

  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#52B788',
    marginBottom: 16,
  },

  subTagline: {
    fontSize: 11.5,
    color: 'rgba(183,228,199,0.7)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 18,
  },

  // ── Loading dots ──
  loadingWrap: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#52B788',
  },

  // ── Bottom brand ──
  bottomBrand: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
