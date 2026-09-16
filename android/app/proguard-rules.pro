# R8 / Proguard Rules for ITFreeSource Bookstore Google Play Release

# Keep Jetpack Compose classes and view models
-keep class androidx.compose.** { *; }
-keep class com.itfreesource.bookstore.model.** { *; }
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}

# Keep Kotlin reflection and metadata
-keepattributes *Annotation*,InnerClasses,Signature,EnclosingMethod

# Keep Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
