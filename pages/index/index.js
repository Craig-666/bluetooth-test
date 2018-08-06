//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    scaning:false,
    loading:false
  },

  onLoad: function () {
    
  },

  scan:function(){
    let that = this
    if(this.data.scaning){
      return
    }
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log(res)
        that.startDevicesDiscovery()
        that.setData({
          loading:true
        })
      },
      fail:function(res){
        console.log(res)
        wx.showModal({
          title: '提示',
          content: '手机蓝牙未打开或不可用，请打开蓝牙重试',
        })
        if(res.errCode == 10001){
          wx.onBluetoothAdapterStateChange(function(res){
            console.log(res)
            if(res.available){
              //可用后 
              that.setData({
                loading: true
              })
              that.startDevicesDiscovery()
            }
          })
        }
      }
    })
  },

  //搜索蓝牙设备
  startDevicesDiscovery:function(){
    let that = this
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey:false,
      success: function(res) {
        console.log(res)
        that.onBluetoothDeviceFound()
      },
    })
  },

  onBluetoothDeviceFound() {
    let that = this
    wx.onBluetoothDeviceFound((res) => {
      console.log('a',res.devices)
      wx.getBluetoothDevices({
        success: function(res) {
          console.log('b',res.devices)
          that.setData({
            devices:res.devices
          })
        },
      })
    })
  },
  //链接设备
  createBLEConnection:function(e){
    let that = this
    let dataset = e.currentTarget.dataset
    wx.createBLEConnection({
      deviceId: dataset.deviceId,
      success: function(res) {
        console.log('suc',res)
        that.setData({
          loading: false
        })
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) { 
            wx.navigateTo({
              url: `../print/print?deviceId=${dataset.deviceId}`,
            })
          },
        })  
      },
      fail:function(res){
        console.log('fail',res)
        wx.showModal({
          title: '提示',
          content: '连接失败',
        })
      }
    })
  },
  //停止搜索蓝牙设备
  stopDevicesDiscovery:function(){
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {

      },
    })
  }
})
