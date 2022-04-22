export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2));
}
export function inAngleRanges(x1, y1, x2, y2, angleRanges) {
    if (!angleRanges) {
        return false;
    }
    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 180;
    for(var i = 0; i < angleRanges.length; ++i){
        var ar = angleRanges[i];
        if (ar && (ar.start == null || angle >= ar.start) && (ar.end == null || angle <= ar.end)) {
            return true;
        }
    }
    return false;
}
