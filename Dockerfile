# Multi-stage Dockerfile for building Kinetic Voice APK

FROM node:18-bullseye AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mv cmdline-tools latest

ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

# Accept Android licenses
RUN yes | sdkmanager --licenses

# Install required Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Expo CLI and EAS CLI globally
RUN npm install -g eas-cli expo-cli

# Copy application code
COPY frontend/ ./

# Configure EAS Build
ENV EXPO_NO_TELEMETRY=1
ENV EXPO_NO_DOTENV=1

# Build APK
# Note: This requires EAS authentication in production
# For local build, use: expo build:android -t apk
RUN npx expo export --platform android

# Generate standalone APK (requires additional configuration)
# RUN eas build --platform android --profile production --local --non-interactive

# Note: Full APK build requires:
# 1. EAS account and authentication
# 2. Android keystore for signing
# 3. Either cloud build (EAS) or local build with full Android SDK

# For development, we'll create an exportable bundle
CMD ["npx", "expo", "export", "--platform", "android", "--output-dir", "dist"]

# Production stage would copy the built APK
# FROM scratch AS final
# COPY --from=builder /app/android/app/build/outputs/apk/release/app-release.apk /kinetic-voice.apk