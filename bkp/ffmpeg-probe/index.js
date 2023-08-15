'use strict'

const execa = require('execa')
const ffprobe = require('node-ffprobe')
const ffprobeInstaller = require('@ffprobe-installer/ffprobe')
 
//console.log(ffprobeInstaller.path, ffprobeInstaller.version)
  
ffprobe.FFPROBE_PATH = ffprobeInstaller.path
module.exports = async (input, opts = []) => {
  const { stdout } = await execa(ffprobeInstaller.path || 'ffprobe', [
    '-print_format', 'json',
    '-show_error',
    '-show_format',
    '-show_streams',
    ...opts,
    input
  ])

  const probe = JSON.parse(stdout)

  if (probe.streams && probe.streams.length) {
    const stream = probe.streams
      .find((stream) => stream.codec_type === 'video') || probe.streams[0]

    probe.duration = Math.round(stream.duration * 1000)
    probe.width = stream.width
    probe.height = stream.height

    const fpsFraction = stream.avg_frame_rate.split('/')
    probe.fps = fpsFraction[0] / fpsFraction[1]
  } else {
    probe.duration = undefined
    probe.width = undefined
    probe.height = undefined
  }

  return probe
}
