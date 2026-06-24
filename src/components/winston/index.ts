import winston, {createLogger, transports, format} from 'winston'
import 'winston-daily-rotate-file'
import {
  getCoreLocation,
} from '../../utilities/index'

const consoleTransport = new transports.Console({})

const dailyRotateFileTransport = new transports.DailyRotateFile({
  dirname: getCoreLocation('logs'),
  filename: '%DATE%_combined.log',
  zippedArchive: true,
  maxSize: '16m',
  maxFiles: '7d',
})

export const fileLogger = createLogger({
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.printf(Q => '[' + Q.timestamp + '] ' + Q.level.toUpperCase() + ': ' + Q.message + '\n')),
  transports: [dailyRotateFileTransport, consoleTransport],
})

// export const fileLogger = winston['createLogger']({
//     'transports': [new winston['transports']['DailyRotateFile']({
//         'dirname': getCoreLocation('logs'),
//         'filename': '%DATE%_combined.log',
//         'zippedArchive': true,
//         'maxSize': '16m',
//         'maxFiles': '7d'
//     })],
//     'format': winston['format']['combine'](winston['format']['timestamp']({
//         'format': 'YYYY-MM-DD HH:mm:ss'
//     }), winston['format']['printf'](Q => '[' + Q['timestamp'] + '] ' + Q['level']['toUpperCase']() + ': ' + Q['message'] + '\n'))
// });


export const somethingWentWrong = () => {
  return console.log('Something went wrong...')
  process.exit()
}
