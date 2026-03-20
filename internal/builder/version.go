package builder

import (
	"fmt"
	"regexp"
	"strconv"
)

func CalculateNextVersion(currentName string) string {
	// Pattern: _V(x).(y).(z)
	re := regexp.MustCompile(`_V(\d+)\.(\d+)\.(\d+)$`)
	matches := re.FindStringSubmatch(currentName)

	if len(matches) == 4 {
		x, _ := strconv.Atoi(matches[1])
		y, _ := strconv.Atoi(matches[2])
		z, _ := strconv.Atoi(matches[3])

		z++
		if z > 9 {
			z = 0
			y++
		}
		if y > 9 {
			y = 0
			x++
		}
		base := currentName[:len(currentName)-len(matches[0])]
		return fmt.Sprintf("%s_V%d.%d.%d", base, x, y, z)
	}

	// Short version: _V(x).(y)
	reShort := regexp.MustCompile(`_V(\d+)\.(\d+)$`)
	if reShort.MatchString(currentName) {
		return currentName + ".0"
	}

	return currentName + "_V1.0.0"
}
