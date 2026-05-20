import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import CartItem from '@/components/CartItem'

export default function Cart() {

  const {cartItems, cartTotal, removeFromCart, updateQuantity} = useCart()
  const router = useRouter()

  const shipping = 2.00;
  const total = cartTotal + shipping;

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
      <Header showBack title='My Cart' />

      {cartItems.length > 0 ? (
        <>
        <ScrollView className='flex-1 px-4 mt-4' showsVerticalScrollIndicator={false}>
          {cartItems.map((item, index) => (
            <CartItem key={index} item={item} onRemove={() => removeFromCart(item.id, item.size)} onUpdateQuantity={(q, size) => updateQuantity(item.id, q, size)} />
          ))}
        </ScrollView>

        <View className='p-4 bg-white rounded-t-3xl shadow-sm'>
          {/* Subtotal */}
          <View className='flex-row justify-between mb-2'>
            <Text className='text-secondary'>Subtotal</Text>
            <Text className='text-primary font-bold'>${cartTotal.toFixed(2)}</Text>
          </View>

          {/* Shipping */}
          <View className='flex-row justify-between mb-2'>
            <Text className='text-secondary'>Shipping</Text>
            <Text className='text-primary font-bold'>${shipping.toFixed(2)}</Text>
          </View>
          {/* Border */}
          <View className='h-[1px] bg-border mb-4' />

          {/* Total */}
          <View className='flex-row justify-between mb-6'>
            <Text className='text-primary font-bold text-lg'>Total</Text>
            <Text className='text-primary font-bold text-lg'>${total.toFixed(2)}</Text>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity onPress={() => router.push('/checkout')} className='bg-primary py-4 rounded-full items-center'>
            <Text className='text-white text-base font-bold'>Checkout</Text>
          </TouchableOpacity>
        </View>
        </>
      ) : (
        <View className='flex-1 justify-center items-center'>
          <Text className='text-secondary text-lg'>Your cart is empty</Text>
          <TouchableOpacity onPress={() => router.push('/')} className='mt-4'>
            <Text className='text-primary font-bold'>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}