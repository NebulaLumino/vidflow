package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

// Log is the global logger instance
var Log zerolog.Logger

func init() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}
	Log = zerolog.New(output).With().Timestamp().Caller().Logger()
}

// Init initializes the logger with custom settings
func Init(level string) {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	lvl, err := zerolog.ParseLevel(level)
	if err != nil {
		lvl = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(lvl)
	
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}
	Log = zerolog.New(output).With().Timestamp().Caller().Logger()
}
