// pages/print/print.js
let util = require('../../utils/util.js') 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceId:'',
    serviceId:'',
    characteristicId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let deviceId = options.deviceId
    this.setData({
      deviceId
    })
    this.getBLEDeviceServices(deviceId)
  },

  handleInput:function(e){
    this.setData({
      printValue:e.detail.value
    })
  },
  print:function(){
    this.writeBLECharacteristicValue()
  },
  getBLEDeviceServices(deviceId) {
    let that = this
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            that.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    let that = this
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            that.setData({
              canWrite: true,
              serviceId:serviceId,
              characteristicId:item.uuid
            })
            // that.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },
  writeBLECharacteristicValue() {
    
    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.serviceId,
      characteristicId: this.data.characteristicId,
      value: util.string2buffer(this.data.printValue),
      success:function(res){
        console.log('write success', res)
      },
      fail:function(re){
        console.log('write fail',re)
      }
    })
  },
})