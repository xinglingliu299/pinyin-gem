// 13-游戏结果页
import React, { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

export default function GameResultPage() {
  return (
    <View style={s.c}>
      <View style={s.content}><Text style={s.emoji}>🎉</Text><Text style={s.title}>太棒了！</Text><Text style={s.stars}>⭐ ⭐ ⭐</Text>
        <View style={s.card}><View style={s.row}><Text style={s.lbl}>得分</Text><Text style={s.val}>85 分</Text></View><View style={s.line}/><View style={s.row}><Text style={s.lbl}>用时</Text><Text style={s.val}>45 秒</Text></View><View style={s.line}/><View style={s.row}><Text style={s.lbl}>正确率</Text><Text style={[s.val,{color:Colors.successGreen}]}>90%</Text></View></View>
      </View>
      <View style={s.acts}><PrimaryButton title='再玩一次' onPress={() => router.back()} /><TouchableOpacity style={s.sec} onPress={() => router.push('/(tabs)' as any)}><Text style={s.secT}>回到首页</Text></TouchableOpacity></View>
    </View>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.pageBackground,justifyContent:'space-between',paddingHorizontal:Spacing.pagePadding},
  content:{flex:1,justifyContent:'center',alignItems:'center'},emoji:{fontSize:64},
  title:{fontFamily:FontFamily.primary,fontSize:FontSizes.title1,fontWeight:FontWeights.light,color:Colors.textPrimary,letterSpacing:-0.5,marginTop:Spacing.gapMD},
  stars:{fontSize:32,marginTop:Spacing.gapMD},
  card:{width:'100%',backgroundColor:Colors.pureWhite,borderRadius:Spacing.cardRadius,padding:Spacing.cardPadding,marginTop:Spacing.sectionGap},
  row:{flexDirection:'row',justifyContent:'space-between',paddingVertical:Spacing.gapSM},
  lbl:{fontFamily:FontFamily.primary,fontSize:FontSizes.callout,color:Colors.textSecondary},
  val:{fontFamily:FontFamily.primary,fontSize:FontSizes.title3,fontWeight:FontWeights.medium,color:Colors.magicPurple},
  line:{height:1,backgroundColor:Colors.borderSubtle},
  acts:{paddingBottom:40,gap:Spacing.elementGap},sec:{paddingVertical:14,alignItems:'center'},secT:{fontFamily:FontFamily.primary,fontSize:FontSizes.callout,color:Colors.textSecondary},
});
