window.__ModuleLoader__.load({
  id: 'dsh-ascoder/client',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')
    var h = React.createElement

    /** 样式表标签 id，重复注入时用于去重。 */
    var STYLE_ID = 'dsh-ascoder/ui.css'
    /** 品牌 token 覆盖标签 id。 */
    var BRAND_STYLE_ID = 'dsh-ascoder/brand.css'
    /** Ascoder 主色（浅色主题下的品牌蓝）。 */
    var ACCENT = '#4D6BFE'
    /** Ascoder 主色深阶，用于 hover。 */
    var ACCENT_STRONG = '#3550E0'
    /** 主色更深一阶，用于 hover。 */
    var ACCENT_DEEP = '#2E45C8'
    /** 插件 UI 的根节点（暗色语义色覆盖的作用范围）。 */
    var ASC_SURFACE_SELECTOR = '.asc-home,.asc-panel,.asc-gate,.asc-crumb,.asc-rolePickWrap,.asc-branchBar,.asc-branchMenu,.asc-switchLayer,.asc-switchCard,.asc-notifyGuide,.asc-taskDock'
    /** DSH 的固定深色标记在 body 上；此选择器直接命中该场景。 */
    var DARK_TOKENS_SELECTOR = 'body[data-ds-dark-theme] ' + ASC_SURFACE_SELECTOR.split(',').join(', body[data-ds-dark-theme] ')


    /** Ascoder logo 鸟形的矢量路径（由原 logo 位图矢量化而来，纯 SVG 代码）。 */
    var ASC_BIRD_PATH = 'M 500.500 0.960 C 469.092 4.632, 436.173 20.903, 415.500 42.974 C 412.750 45.910, 409.751 49.103, 408.835 50.071 C 405.379 53.723, 390.052 76.478, 387.330 82 C 386.381 83.925, 385.323 85.725, 384.979 86 C 384.635 86.275, 384.055 87.175, 383.690 88 C 383.325 88.825, 381.250 92.650, 379.079 96.500 C 375.214 103.354, 363.337 127.110, 356.332 142 C 354.391 146.125, 352.323 150.400, 351.736 151.500 C 347.728 159.009, 345.904 163.237, 346.439 163.773 C 346.781 164.114, 349.488 163.568, 352.456 162.560 C 356.788 161.087, 359.790 160.827, 367.676 161.238 C 379.431 161.852, 385.966 164.084, 394.776 170.494 C 402.927 176.425, 404.953 176.385, 407.363 170.246 C 409.934 163.699, 421.663 138.854, 426.127 130.500 C 427.303 128.300, 428.735 125.600, 429.310 124.500 C 432.908 117.614, 433.550 116.451, 434.002 116.001 C 434.277 115.725, 435.168 114.150, 435.981 112.500 C 436.794 110.850, 438.481 108.108, 439.730 106.406 C 440.978 104.704, 442 102.997, 442 102.613 C 442 101.117, 450.708 90.143, 457.430 83.169 C 476.354 63.534, 500.494 54.696, 526.780 57.780 C 550.653 60.581, 566.971 70.141, 583.481 91 C 592.281 102.119, 598.152 107.393, 607.762 112.812 C 612.509 115.490, 616.543 118.130, 616.726 118.679 C 616.909 119.228, 614.614 121.301, 611.626 123.285 C 605.137 127.593, 596.273 136.348, 590.683 143.968 C 588.451 147.011, 586.260 149.650, 585.813 149.833 C 585.366 150.017, 585 150.804, 585 151.583 C 585 152.363, 584.652 153, 584.227 153 C 583.802 153, 582.581 154.688, 581.513 156.750 C 580.445 158.813, 578.093 162.871, 576.286 165.769 C 574.479 168.668, 573 171.630, 573 172.353 C 573 173.075, 572.692 173.975, 572.315 174.352 C 571.682 174.985, 570.557 177.779, 567.827 185.500 C 567.243 187.150, 566.414 190.750, 565.983 193.500 C 565.256 198.147, 562.031 211.472, 559.915 218.571 C 559.412 220.260, 559 222.963, 559 224.578 C 559 226.192, 558.538 229.085, 557.974 231.007 C 557.006 234.299, 556.040 247.142, 553.949 284.500 C 552.359 312.893, 551.237 322.842, 547.942 337.764 C 547.424 340.110, 547 343.228, 547 344.693 C 547 346.159, 546.587 348.740, 546.082 350.429 C 545.577 352.118, 544.410 357.100, 543.488 361.500 C 542.567 365.900, 541.405 370.281, 540.906 371.236 C 540.408 372.191, 540 373.960, 540 375.165 C 540 377.323, 538.963 381.099, 536.476 388 C 535.783 389.925, 534.631 393.525, 533.918 396 C 533.204 398.475, 532.031 401.388, 531.310 402.473 C 530.590 403.557, 530 405.251, 530 406.236 C 530 407.221, 529.603 408.809, 529.117 409.764 C 528.631 410.719, 527.779 412.625, 527.224 414 C 525.478 418.322, 520.832 428.355, 518.888 432 C 517.861 433.925, 515.556 438.425, 513.766 442 C 511.975 445.575, 510.260 448.725, 509.953 449 C 509.647 449.275, 508.661 451.075, 507.764 453 C 506.866 454.925, 505.202 457.494, 504.066 458.708 C 502.930 459.923, 502 461.405, 502 462.002 C 502 462.599, 500.875 464.301, 499.500 465.783 C 498.125 467.266, 497 469.047, 497 469.740 C 497 470.433, 496.550 471, 496 471 C 495.450 471, 495 471.469, 495 472.042 C 495 472.615, 494.542 473.628, 493.981 474.292 C 490.669 478.220, 488.974 480.417, 486.865 483.514 C 485.564 485.424, 484.163 486.989, 483.750 486.993 C 483.337 486.997, 483 487.447, 483 487.992 C 483 488.993, 482.132 490.100, 474.060 499.390 C 469.051 505.155, 443.092 531.165, 438.500 535.020 C 392.887 573.310, 335.431 598.997, 266.500 611.918 C 250.216 614.971, 236.356 616.783, 216.898 618.406 C 189.594 620.682, 177 621.264, 177 620.250 C 177 619.744, 178.237 618.211, 179.750 616.843 C 181.262 615.475, 184.300 612.179, 186.500 609.519 C 188.700 606.859, 191.659 603.291, 193.077 601.591 C 196.649 597.305, 210 578.274, 210 577.468 C 210 577.105, 211.013 575.396, 212.250 573.668 C 213.488 571.941, 214.981 569.622, 215.570 568.514 C 216.158 567.406, 217.913 564.250, 219.471 561.500 C 221.028 558.750, 223.858 553.350, 225.759 549.500 C 227.660 545.650, 229.704 541.600, 230.302 540.500 C 235.835 530.315, 242 517.386, 242 515.967 C 242 513.529, 239.454 512.799, 233.529 513.540 C 227.700 514.268, 218.049 512.738, 210.389 509.872 C 205.092 507.891, 193 497.671, 193 495.176 C 193 493.446, 189.813 493.786, 187.410 495.772 C 186.260 496.723, 184.735 499.075, 184.020 501 C 183.306 502.925, 181.708 506.750, 180.468 509.500 C 179.229 512.250, 177.937 515.175, 177.597 516 C 177.256 516.825, 176.116 518.850, 175.062 520.500 C 174.008 522.150, 173.113 524.288, 173.073 525.250 C 173.033 526.212, 172.550 527, 172 527 C 171.450 527, 171 527.845, 171 528.878 C 171 529.910, 170.325 531.315, 169.500 532 C 168.675 532.685, 168 533.865, 168 534.622 C 168 535.380, 167.660 536, 167.244 536 C 166.828 536, 165.843 537.462, 165.054 539.250 C 161.565 547.152, 142.392 571.678, 132.369 581.057 C 119.266 593.321, 105.752 602.094, 90.101 608.499 C 72.895 615.540, 60.760 618.173, 35.473 620.351 C 22.987 621.427, 18.568 622.197, 15.473 623.837 C 11 626.207, 5 631.448, 5 632.986 C 5 633.544, 4.550 634, 4 634 C 3.450 634, 3 634.845, 3 635.878 C 3 636.910, 2.325 638.315, 1.500 639 C 0.385 639.925, 0 642.396, 0 648.630 C 0 655.860, 0.379 657.725, 2.750 662.173 C 6.502 669.210, 11.197 673.542, 17.879 676.131 C 22.770 678.025, 26.423 678.408, 46 679.073 C 109.322 681.224, 192.257 679.774, 225.500 675.936 C 313.765 665.745, 367.970 649.336, 424.681 615.639 C 434.261 609.946, 459.678 592.740, 461 591.053 C 461.275 590.702, 464.193 588.244, 467.485 585.590 C 470.777 582.937, 476.177 578.458, 479.485 575.637 C 487.058 569.180, 517.493 538.660, 521.500 533.505 C 523.150 531.383, 525.063 529.083, 525.750 528.395 C 526.438 527.706, 527 526.864, 527 526.524 C 527 526.183, 528.125 524.862, 529.500 523.588 C 530.875 522.313, 532 520.838, 532 520.310 C 532 519.781, 533.125 518.292, 534.500 517 C 535.875 515.708, 537 514.055, 537 513.326 C 537 512.597, 537.399 512, 537.886 512 C 538.373 512, 539.477 510.514, 540.339 508.697 C 541.201 506.881, 542.828 504.561, 543.953 503.542 C 545.079 502.524, 546 501.280, 546 500.778 C 546 500.277, 547.125 498.392, 548.500 496.589 C 549.875 494.786, 551 492.791, 551 492.156 C 551 491.520, 551.379 491, 551.843 491 C 552.306 491, 553.543 489.313, 554.593 487.250 C 555.642 485.188, 556.791 483.275, 557.148 483 C 557.504 482.725, 558.881 480.475, 560.208 478 C 563.890 471.133, 565.234 468.640, 566.135 467 C 567.373 464.749, 578.917 441.088, 581.016 436.500 C 582.696 432.830, 584.896 427.040, 588.048 418 C 588.719 416.075, 589.571 413.825, 589.941 413 C 592.043 408.311, 601.929 375.196, 603.075 369 C 603.533 366.525, 604.314 362.475, 604.810 360 C 605.306 357.525, 606.253 352.575, 606.914 349 C 607.575 345.425, 608.540 340.581, 609.058 338.236 C 609.576 335.890, 610 331.750, 610 329.035 C 610 326.320, 610.430 321.939, 610.956 319.299 C 612.159 313.261, 613.929 290.184, 615.082 265.500 C 616.266 240.150, 617.474 227.731, 619.461 220.500 C 620.368 217.200, 621.478 212.925, 621.929 211 C 623.206 205.550, 624.127 203.255, 629.948 191 C 634.094 182.273, 636.472 178.191, 638.939 175.565 C 640.073 174.358, 641 173.075, 641 172.712 C 641 171.954, 647.830 164.210, 653.068 159.029 C 662.812 149.392, 675.178 142.011, 697.679 132.401 C 714.226 125.333, 718.449 121.855, 719.571 114.373 C 721.079 104.316, 717.781 98.418, 706.641 91.255 C 692.969 82.464, 676.525 76.095, 656.953 72.010 C 641.902 68.868, 638.877 67.308, 634.320 60.336 C 632.222 57.126, 630.277 54.275, 629.997 54 C 629.717 53.725, 628.312 51.919, 626.874 49.986 C 621.693 43.025, 608.324 30.706, 599.605 24.859 C 582.403 13.323, 564.630 6.134, 544.013 2.375 C 534.033 0.556, 510.506 -0.209, 500.500 0.960 M 517.994 94.875 C 510.655 97.281, 503.721 102.559, 501.625 107.332 C 498.348 114.797, 497.777 117.286, 498.198 122.255 C 498.731 128.527, 500.889 133.342, 505.671 138.929 C 517.892 153.206, 539.005 149.954, 548.289 132.365 C 552.134 125.081, 552.172 114.849, 548.376 108.730 C 544.475 102.440, 542.030 100.072, 536.563 97.289 C 531.308 94.615, 522.341 93.449, 517.994 94.875 M 206.341 155.030 C 196.552 156.789, 186.630 161.659, 180.500 167.713 C 176.049 172.108, 173 175.887, 173 177.008 C 173 177.553, 172.624 178, 172.165 178 C 171.341 178, 164 193.245, 164 194.956 C 164 195.441, 163.356 197.112, 162.568 198.669 C 161.780 200.226, 159.938 205.550, 158.474 210.500 C 157.010 215.450, 155.457 220.625, 155.022 222 C 154.587 223.375, 153.675 226.525, 152.993 229 C 150.337 238.651, 148.718 243.539, 147.877 244.450 C 147.395 244.973, 147 246.024, 147 246.787 C 147 249.384, 140.522 257.203, 136.795 259.104 C 133.997 260.532, 130.948 261, 124.441 261 C 113.064 261, 109.938 262.473, 106.771 269.325 C 105.456 272.171, 103.814 276.525, 103.122 279 C 102.430 281.475, 101.445 284.882, 100.932 286.571 C 98.654 294.077, 100.302 297.879, 108.364 303.715 C 119.292 311.624, 121.539 315.949, 121.398 328.802 C 121.337 334.333, 120.830 338.570, 120.148 339.252 C 119.516 339.884, 119 341.309, 119 342.420 C 119 344.326, 116.990 351.086, 111.991 366 C 107.574 379.176, 105.237 397.992, 106.798 407.820 C 108.572 418.990, 109.591 422.617, 111.843 425.779 C 113.029 427.445, 114 429.073, 114 429.397 C 114 430.121, 117.643 434.450, 121 437.715 C 128.132 444.652, 140.523 451.095, 157.853 456.878 C 170.945 461.247, 173.010 461.600, 176.025 459.987 C 178.051 458.903, 182 450.935, 182 447.932 C 182 446.934, 182.450 445.840, 183 445.500 C 183.550 445.160, 184 443.777, 184 442.427 C 184 441.077, 184.426 439.191, 184.947 438.236 C 186.895 434.662, 189.126 425.973, 188.557 424.178 C 187.578 421.094, 183.811 418.350, 178 416.488 C 166.848 412.915, 161.931 409.472, 159.429 403.484 C 158.076 400.246, 158.019 398.728, 159.039 393.096 C 159.697 389.468, 161.257 383.350, 162.506 379.500 C 167.599 363.800, 170.009 355.384, 170.004 353.309 C 170.002 352.104, 170.390 350.877, 170.867 350.582 C 172.266 349.717, 173.323 341.218, 173.302 331 C 173.279 320.029, 172.478 315.561, 169.866 311.846 C 168.840 310.386, 168 308.788, 168 308.295 C 168 307.802, 165.750 304.875, 163 301.789 C 160.250 298.704, 158 295.734, 158 295.189 C 158 294.645, 160.363 293.653, 163.250 292.986 C 171.495 291.079, 180.388 286.259, 185.921 280.698 C 188.714 277.889, 191 275.204, 191 274.729 C 191 274.255, 192.125 272.392, 193.500 270.589 C 194.875 268.786, 196 266.785, 196 266.142 C 196 265.499, 196.395 264.191, 196.878 263.236 C 199.009 259.021, 201 253.813, 201 252.453 C 201 251.639, 201.406 250.191, 201.903 249.236 C 202.399 248.281, 203.326 245.475, 203.963 243 C 205.927 235.370, 208.170 227.610, 209.106 225.203 C 209.598 223.940, 210 222.009, 210 220.912 C 210 217.925, 215.856 207.258, 218.743 204.987 C 223.957 200.886, 228.390 200.386, 237.876 202.830 C 252.968 206.719, 253.923 206.147, 258.460 190.500 C 259.416 187.200, 260.604 183.719, 261.100 182.764 C 261.595 181.809, 262 179.761, 262 178.214 C 262 176.666, 262.392 174.973, 262.871 174.450 C 264.917 172.218, 264.965 168.225, 262.977 165.698 C 257.865 159.199, 221.384 152.327, 206.341 155.030 M 349 192.373 C 346.525 193.094, 342.583 194.666, 340.240 195.867 C 335.913 198.085, 327 206.456, 327 208.301 C 327 208.856, 325.875 210.786, 324.500 212.589 C 323.125 214.392, 322 216.534, 322 217.350 C 322 218.166, 321.658 218.983, 321.241 219.167 C 320.157 219.643, 315 229.910, 315 231.592 C 315 232.367, 314.550 233, 314 233 C 313.450 233, 313 233.684, 313 234.520 C 313 235.356, 311.875 237.822, 310.500 240 C 309.125 242.178, 307.967 244.532, 307.927 245.230 C 307.887 245.929, 306.992 247.850, 305.938 249.500 C 304.884 251.150, 303.744 253.175, 303.405 254 C 303.066 254.825, 300.753 259.775, 298.265 265 C 295.776 270.225, 293.012 276.075, 292.120 278 C 291.229 279.925, 290.163 281.650, 289.750 281.833 C 289.337 282.017, 289 282.740, 289 283.441 C 289 284.142, 287.425 287.737, 285.500 291.431 C 283.575 295.124, 282 298.750, 282 299.489 C 282 300.229, 281.663 300.983, 281.250 301.167 C 280.837 301.350, 279.775 303.075, 278.888 305 C 274.403 314.739, 271.425 320.533, 270.750 320.833 C 270.337 321.017, 270 321.810, 270 322.597 C 270 323.905, 269.099 326.014, 266.838 330 C 266.370 330.825, 265.723 332.175, 265.400 333 C 264.560 335.146, 256.102 352.933, 254.226 356.500 C 252.207 360.337, 251.530 361.714, 249.556 366 C 248.670 367.925, 247.555 370.175, 247.078 371 C 246.098 372.695, 238.096 389.557, 235.591 395.208 C 234.686 397.247, 233.509 399.186, 232.973 399.517 C 232.438 399.847, 232 400.991, 232 402.059 C 232 403.127, 231.550 404, 231 404 C 230.450 404, 230 404.561, 230 405.247 C 230 406.825, 219.759 427.385, 218.750 427.833 C 218.338 428.017, 217.967 429.142, 217.927 430.333 C 217.887 431.525, 216.992 433.850, 215.938 435.500 C 214.884 437.150, 213.739 439.175, 213.392 440 C 213.046 440.825, 211.241 444.705, 209.381 448.623 C 205.148 457.541, 204.872 463.841, 208.412 470.826 C 212.514 478.921, 224.269 483.722, 237.530 482.719 C 248.582 481.883, 256.300 477.879, 262.052 469.997 C 264.229 467.013, 275.715 444.352, 283.593 427.500 C 289.729 414.373, 300.338 392.183, 301.762 389.500 C 303.887 385.492, 303.802 385.666, 312.033 368.500 C 319.489 352.949, 327.846 335.974, 329.756 332.500 C 330.361 331.400, 334.093 323.750, 338.050 315.500 C 346.003 298.918, 359.214 271.800, 375.335 238.967 C 381.149 227.124, 386.203 215.582, 386.565 213.319 C 387.895 205, 383.357 197.833, 374.157 193.726 C 368.417 191.164, 355.536 190.471, 349 192.373 M 417.416 210.381 C 414.241 211.805, 410.676 217.847, 408.790 225 C 408.282 226.925, 407.401 230.300, 406.831 232.500 C 406.261 234.700, 405.573 238.885, 405.302 241.800 C 404.672 248.572, 406.280 250.106, 417.643 253.572 C 424.655 255.711, 426.473 256.735, 429.465 260.230 C 432.830 264.162, 433 264.720, 433 271.859 C 433 275.983, 432.580 280.740, 432.068 282.429 C 431.555 284.118, 430.621 287.525, 429.992 290 C 429.363 292.475, 428.208 295.774, 427.425 297.331 C 426.641 298.888, 426 300.881, 426 301.760 C 426 303.243, 424.734 307.755, 422.986 312.500 C 418.566 324.500, 417.465 343.267, 420.671 351.967 C 422.591 357.177, 429.358 367.138, 433.898 371.437 C 435.604 373.052, 437 374.658, 437 375.004 C 437 375.351, 433.674 376.418, 429.609 377.377 C 422.145 379.136, 415.109 382.920, 408.870 388.531 C 404.918 392.084, 400 398.407, 400 399.933 C 400 400.520, 399.550 401, 399 401 C 398.450 401, 397.986 401.788, 397.969 402.750 C 397.952 403.712, 396.831 406.750, 395.478 409.500 C 394.125 412.250, 393.014 415.368, 393.009 416.429 C 392.999 418.591, 391.456 423.844, 389.380 428.784 C 388.621 430.590, 388 433.033, 388 434.213 C 388 436.486, 386.343 442.335, 384.877 445.236 C 384.395 446.191, 384 447.897, 384 449.027 C 384 452.358, 378.035 462.839, 374.848 465.108 C 370.535 468.179, 365.575 468.447, 355.990 466.124 C 347.871 464.156, 343.922 464.180, 341.315 466.213 C 339.453 467.665, 336.002 474.831, 335.985 477.281 C 335.970 479.414, 334.141 485.422, 332.874 487.500 C 332.538 488.050, 331.731 490.772, 331.080 493.549 C 329.460 500.461, 330.748 503.561, 336.246 505.982 C 343.280 509.078, 359.804 512.832, 371.560 514.003 C 384.815 515.324, 393.682 513.906, 402.765 509.010 C 409.605 505.324, 412.193 503.126, 417.500 496.497 C 419.700 493.749, 421.730 491.275, 422.010 491 C 422.601 490.421, 427.747 479.685, 429.199 476 C 429.742 474.625, 430.818 472.226, 431.593 470.669 C 432.367 469.112, 433 467.001, 433 465.978 C 433 464.955, 433.450 463.840, 434 463.500 C 434.550 463.160, 435 461.585, 435 460 C 435 458.415, 435.450 456.840, 436 456.500 C 436.550 456.160, 437 454.911, 437 453.724 C 437 452.538, 437.628 449.752, 438.397 447.533 C 439.165 445.315, 440.284 441.700, 440.884 439.500 C 443.284 430.701, 445.285 424.942, 446.120 424.426 C 446.604 424.127, 447 423.090, 447 422.121 C 447 419.197, 453.673 412.342, 459.199 409.588 C 463.547 407.421, 465.761 407, 472.795 407 C 480.871 407, 481.308 406.882, 484.045 403.952 C 488.344 399.350, 493.484 383.514, 493.192 375.769 C 493.045 371.848, 490.111 368.299, 483.295 363.796 C 476.006 358.981, 474.579 357.321, 472.295 351 C 470.804 346.876, 470.609 336.931, 471.932 332.571 C 472.445 330.882, 473.373 327.475, 473.994 325 C 474.615 322.525, 475.579 319.150, 476.136 317.500 C 476.693 315.850, 477.758 312.700, 478.504 310.500 C 480.963 303.241, 484.871 289.568, 485.649 285.500 C 486.624 280.406, 486.589 257.457, 485.600 253.500 C 482.549 241.286, 470.788 228.099, 456.343 220.695 C 446.461 215.630, 432.050 210.534, 424.930 209.587 C 422.112 209.212, 419.378 209.501, 417.416 210.381'

    /** 鸟形 SVG 的 viewBox。 */
    var ASC_BIRD_VIEWBOX = '0 0 720 680'

    /** 小鸟 SVG 的 data URI：给 CSS 背景用（如运行状态图标），与组件同源绘制。 */
    var ASC_BIRD_SVG_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + ASC_BIRD_VIEWBOX + '">' +
      '<defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#F87171"/><stop offset="45%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#8B5CF6"/>' +
      '</linearGradient></defs>' +
      '<path d="' + ASC_BIRD_PATH + '" fill="url(#g)" fill-rule="evenodd"/>' +
      '</svg>',
    )
    var CSS = [
      /* ---- tokens：仅在本插件容器内生效，颜色全部走宿主 token，明暗自动适配 ---- */
      ASC_SURFACE_SELECTOR + '{',
      '--asc-ink:var(--dsw-alias-label-primary,#1B1F24);',
      '--asc-ink-2:var(--dsw-alias-label-secondary,#4A5158);',
      // 宿主 label-tertiary 在白底约 3.7:1，低于 AA 4.5:1，这里用达标的固定值（深色主题另行覆盖）
      '--asc-ink-3:#5A626C;',
      '--asc-line:var(--dsw-alias-border-l2,#E5E7EB);',
      '--asc-line-strong:var(--dsw-alias-border-l4,#D0D5DD);',
      '--asc-surface:var(--dsw-alias-bg-layer-1,#fff);',
      '--asc-surface-2:var(--dsw-alias-bg-layer-2,#FAFBFC);',
      '--asc-card:var(--dsw-alias-settings-card-fill,#FAFBFC);',
      '--asc-hover:var(--dsw-alias-interactive-bg-hover,#F2F4F7);',
      '--asc-accent:' + ACCENT + ';',
      '--asc-accent-strong:' + ACCENT_STRONG + ';',
      /* 语义色自带两套值：宿主的 success/warn token 在浅色下太亮（green-500 对比度 2.3:1），不能当正文颜色 */
      '--asc-ok:#0F7B4D;',
      '--asc-warn:#9A4A00;',
      '--asc-bad:#B42318;',
      '--asc-r-ctl:8px;--asc-r-card:12px;--asc-r-pill:999px;',
      '--asc-font:var(--dsh-font-family-text,var(--ds-font-family-text,inherit));',
      '--asc-mono:var(--dsh-font-family-code,var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace));',
      '--asc-ease:cubic-bezier(.2,.7,.3,1);',
      'font-family:var(--asc-font);color:var(--asc-ink);font-size:13px;line-height:1.55;',
      '}',
      /* ---- 基础控件 ---- */
      '.asc-btn{appearance:none;font:inherit;font-size:13px;line-height:1.2;display:inline-flex;align-items:center;gap:6px;',
      'border:1px solid var(--asc-line);background:var(--asc-surface);color:var(--asc-ink);',
      'border-radius:var(--asc-r-ctl);padding:7px 13px;cursor:pointer;white-space:nowrap;',
      'transition:background-color .12s var(--asc-ease),border-color .12s var(--asc-ease),transform .12s var(--asc-ease)}',
      '.asc-btn:hover:not(:disabled){background:var(--asc-hover);border-color:var(--asc-line-strong)}',
      '.asc-btn:active:not(:disabled){transform:translateY(1px)}',
      '.asc-btn:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-btn:disabled{opacity:.45;cursor:not-allowed}',
      '.asc-icon{flex:none;transition:transform .18s var(--asc-ease)}',
      '.asc-metaItem{display:inline-flex;align-items:center;gap:4px}',
      '.asc-pill--ready::before{content:"";display:inline-block;width:5px;height:5px;border-radius:999px;background:currentColor;margin-right:4px;vertical-align:middle}',
      '.asc-btn--lead{transition:background-color .15s var(--asc-ease),border-color .15s var(--asc-ease),transform .15s var(--asc-ease),box-shadow .15s var(--asc-ease)}',
      '.asc-btn--lead:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 18px color-mix(in srgb,var(--asc-accent-strong) 26%,transparent)}',
      '.asc-btn--lead:hover:not(:disabled) .asc-icon--arrow{transform:translateX(3px)}',
      '.asc-btn--lead:hover:not(:disabled) .asc-icon--plus{transform:rotate(90deg)}',
      '.asc-btn--lead:active:not(:disabled){transform:translateY(0) scale(.985);box-shadow:none}',
      '.asc-btn--sm{padding:5px 9px;font-size:12px}',
      '.asc-iconBtn{appearance:none;width:34px;height:34px;flex:none;display:inline-flex;align-items:center;justify-content:center;',
      'border-radius:9px;border:1px solid var(--asc-line);background:var(--asc-surface);color:var(--asc-ink-2);cursor:pointer;',
      'transition:background-color .15s var(--asc-ease),border-color .15s var(--asc-ease),color .15s var(--asc-ease),transform .15s var(--asc-ease)}',
      '.asc-iconBtn:hover:not(:disabled){background:var(--asc-hover);border-color:var(--asc-line-strong);color:var(--asc-ink);transform:translateY(-1px)}',
      '.asc-iconBtn:hover:not(:disabled) .asc-icon--refresh{transform:rotate(45deg)}',
      '.asc-iconBtn:active:not(:disabled){transform:translateY(0) scale(.96)}',
      '.asc-iconBtn:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-iconBtn:disabled{opacity:.45;cursor:not-allowed}',
      '.asc-iconBtn--danger:hover:not(:disabled){color:var(--asc-bad);border-color:color-mix(in srgb,var(--asc-bad) 42%,var(--asc-line));',
      'background:color-mix(in srgb,var(--asc-bad) 8%,transparent)}',
      '.asc-iconBtn--danger:hover:not(:disabled) .asc-icon--trash{transform:rotate(-8deg)}',
      '.asc-hint--icons{display:inline-flex;align-items:center;gap:6px}',
      '.asc-dot{width:3px;height:3px;border-radius:999px;background:currentColor;opacity:.45;flex:none}',
      '@keyframes asc-row-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '.asc-btn--primary{background:var(--asc-accent-strong);border-color:var(--asc-accent-strong);color:#fff;font-weight:500}',
      '.asc-btn--primary:hover:not(:disabled){background:' + ACCENT_DEEP + ';border-color:' + ACCENT_DEEP + '}',
      '.asc-btn--quiet{border-color:transparent;background:transparent;color:var(--asc-ink-2);padding:7px 10px}',
      '.asc-btn--icon{padding:7px;border-radius:8px;line-height:0}',
      '.asc-btn--quiet:hover:not(:disabled){background:var(--asc-hover);border-color:transparent;color:var(--asc-ink)}',
      '.asc-btn--danger{color:var(--asc-bad);border-color:var(--asc-line)}',
      '.asc-btn--danger:hover:not(:disabled){background:color-mix(in srgb,var(--asc-bad) 8%,transparent);border-color:color-mix(in srgb,var(--asc-bad) 40%,var(--asc-line))}',
      '.asc-input{font:inherit;font-size:13px;width:100%;box-sizing:border-box;padding:8px 11px;color:var(--asc-ink);',
      'background:var(--asc-surface);border:1px solid var(--asc-line);border-radius:var(--asc-r-ctl);',
      'transition:border-color .12s var(--asc-ease),box-shadow .12s var(--asc-ease)}',
      '.asc-input::placeholder{color:var(--asc-ink-3)}',
      '.asc-input:hover{border-color:var(--asc-line-strong)}',
      '.asc-input:focus{outline:none;border-color:var(--asc-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--asc-accent) 16%,transparent)}',
      '.asc-select--full{max-width:none;font-size:13px;padding:8px 11px;border-radius:6px}',
      '.asc-select{font:inherit;font-size:12px;max-width:200px;padding:4px 7px;color:var(--asc-ink);background:var(--asc-surface);',
      'border:1px solid var(--asc-line);border-radius:6px;cursor:pointer}',
      '.asc-select:focus-visible{outline:2px solid var(--asc-accent);outline-offset:1px}',
      /* ---- 排版 ---- */
      '.asc-home{position:fixed;inset:0;z-index:60;pointer-events:auto;overflow:auto;background:var(--asc-surface);',
      'padding:40px 24px 56px;-webkit-font-smoothing:antialiased}',
      '.asc-homeInner{max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:24px;',
      'animation:ascRise .24s cubic-bezier(.2,.8,.2,1) both}',
      '@keyframes ascRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '.asc-homeHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--asc-line)}',
      '.asc-homeBrand{display:flex;gap:12px;align-items:center;min-width:0}',
      '.asc-homeTitle{font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.25}',
      '.asc-wm{display:inline-flex;align-items:center;gap:6px;min-width:0}',
      '.asc-wm-text{font-weight:800;letter-spacing:-.03em;line-height:1;white-space:nowrap;',
      'background:linear-gradient(100deg,#FB7185 0%,#38BDF8 38%,#3B82F6 62%,#8B5CF6 100%);',
      'background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;',
      'animation:ascShimmer 5.5s linear infinite;will-change:background-position;transition:filter .2s var(--asc-ease)}',
      '.asc-wm:hover .asc-wm-text{animation-duration:2.2s}',
      '.asc-brand-name:hover .asc-wm-text{animation-duration:2.2s}',
      '.asc-branchBadge{display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:2px 8px;border-radius:999px;',
      'background:color-mix(in srgb,var(--asc-accent-strong) 10%,transparent);color:var(--asc-accent-strong);',
      'border:1px solid color-mix(in srgb,var(--asc-accent-strong) 22%,transparent);',
      'font-size:11.5px;line-height:1.45;white-space:nowrap;vertical-align:middle}',
      '.asc-branchBadgeIcon{flex:none}',
      '.asc-branchBadgeText{max-width:96px;overflow:hidden;text-overflow:ellipsis}',
      '.asc-wm-text--nav{font-size:17px}',
      '.asc-wm-text--hero{font-size:inherit;font-weight:inherit;letter-spacing:inherit;line-height:inherit}',
      '@keyframes ascHeroFloat{',
      '0%,100%{transform:translateY(0) rotate(-1deg) scale(1)}',
      '35%{transform:translateY(-3px) rotate(3deg) scale(1.04)}',
      '70%{transform:translateY(-1px) rotate(-2deg) scale(1.02)}}',
      '.asc-bird.asc-bird--hero{animation:ascHeroFloat 5s cubic-bezier(.45,0,.55,1) infinite,ascBrandGlow 4.5s ease-in-out infinite}',
      '.asc-bird--hero:hover{transform:rotate(-10deg) scale(1.12)}',
      '@keyframes ascShimmer{0%{background-position:0% 50%}100%{background-position:220% 50%}}',
      '@keyframes ascFloat{0%,100%{transform:translateY(0) rotate(0) scale(1)}50%{transform:translateY(-0.9px) rotate(-1.6deg) scale(1.015)}}',
      '@keyframes asc-float-tiny{0%,100%{translate:0 0}50%{translate:0 -0.5px}}',
      '@keyframes ascBrandGlow{0%,100%{filter:drop-shadow(0 0 0 rgba(56,189,248,0))}50%{filter:drop-shadow(0 0 5px rgba(56,189,248,.32))}}',
      '@keyframes ascWing{0%,100%{transform:rotate(0)}50%{transform:rotate(-7deg)}}',
      '.asc-bird{display:block;overflow:visible;transform-origin:50% 60%}',
      '.asc-bird--live{animation:ascFloat 6s ease-in-out infinite,ascBrandGlow 4.5s ease-in-out infinite;',
      'transition:transform .22s cubic-bezier(.2,.8,.2,1);will-change:transform,filter}',
      '.asc-bird:hover{transform:rotate(-9deg) scale(1.1)}',
      '.asc-brand-name:hover .asc-bird{animation-duration:2.4s,1.6s}',
      '.asc-bird-wing{transform-origin:16px 17px;animation:ascWing 4.6s ease-in-out infinite}',
      '.asc-bird:hover .asc-bird-wing,.asc-brand-name:hover .asc-bird-wing{animation-duration:1.1s}',
      '.asc-brand-name:hover .asc-bird{animation-duration:1.6s}',
      '@media (prefers-reduced-motion: reduce){',
      '.asc-wm-text,.asc-bird,.asc-bird-wing,.asc-bird--hero{animation:none !important}',
      '.asc-bird--live{filter:none !important}',
      '}',
      '.asc-brandLabel{font-size:13px;color:var(--asc-ink-3);white-space:nowrap}',
      '.asc-brand-label::before{content:"·";margin-right:6px}',
      '.asc-branchBar{display:inline-flex;align-items:center;gap:6px;position:relative;flex-wrap:wrap;height:28px}',
      '.asc-branchPill{appearance:none;font:inherit;font-size:12.5px;display:inline-flex;align-items:center;gap:5px;height:28px;',
      'padding:0 8px 0 9px;border:1px solid var(--asc-line);border-radius:8px;background:var(--asc-surface);color:var(--asc-ink-2);',
      'cursor:pointer;white-space:nowrap;transition:background-color .14s var(--asc-ease),border-color .14s var(--asc-ease),color .14s var(--asc-ease)}',
      '.asc-branchPill:hover{background:var(--asc-hover);color:var(--asc-ink)}',
      '.asc-branchPill:disabled{cursor:default;opacity:.62}',
      '.asc-branchPill[aria-expanded="true"]{border-color:var(--asc-accent);color:var(--asc-ink)}',
      '.asc-branchPill:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-branchPillIcon{flex:none;color:var(--asc-accent-strong)}',
      '.asc-branchPillName{max-width:150px;overflow:hidden;text-overflow:ellipsis;font-weight:500}',
      '.asc-branchPillState{font-size:10.5px;color:var(--asc-warn,#a86400);padding:0 2px}',
      '.asc-branchChevron{flex:none;color:var(--asc-ink-3);transition:transform .16s var(--asc-ease)}',
      '.asc-branchPill[aria-expanded="true"] .asc-branchChevron{transform:rotate(180deg)}',
      '.asc-branchDivider{width:1px;height:16px;background:var(--asc-line);flex:none}',
      '.asc-branchAction{appearance:none;font:inherit;font-size:12.5px;display:inline-flex;align-items:center;gap:5px;height:28px;',
      'padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--asc-ink-2);cursor:pointer;',
      'transition:background-color .14s var(--asc-ease),color .14s var(--asc-ease)}',
      '.asc-branchAction:hover:not(:disabled){background:var(--asc-hover);color:var(--asc-ink)}',
      '.asc-branchAction:disabled{opacity:.55;cursor:default}',
      '.asc-branchAction:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-branchActionIcon{flex:none}',
      '.asc-spinner{width:12px;height:12px;border-radius:999px;flex:none;',
      'border:1.6px solid color-mix(in srgb,var(--asc-accent-strong) 30%,transparent);border-top-color:var(--asc-accent-strong);',
      'animation:asc-spin .7s linear infinite}',
      '@keyframes asc-spin{to{transform:rotate(360deg)}}',
      '.asc-branchBarHint{font-size:11.5px;color:var(--asc-ink-3);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-branchBarHint--ok{color:var(--asc-ok)}',
      '.asc-branchBarHint--error{color:var(--asc-bad)}',
      '.asc-branchMenuHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 6px 8px}',
      '.asc-branchMenuTitle{font-size:11.5px;color:var(--asc-ink-3);letter-spacing:.02em}',
      '.asc-branchMenuClose{appearance:none;border:0;background:transparent;color:var(--asc-ink-3);font-size:15px;line-height:1;',
      'cursor:pointer;padding:2px 4px;border-radius:6px}',
      '.asc-branchMenuClose:hover{background:var(--asc-hover);color:var(--asc-ink)}',
      '.asc-branchMenuGroup{padding:4px 0}',
      '.asc-branchMenuGroup + .asc-branchMenuGroup{border-top:1px solid var(--asc-line)}',
      '.asc-branchMenuGroupTitle{font-size:10.5px;color:var(--asc-ink-3);padding:2px 8px 4px;letter-spacing:.04em}',
      '.asc-branchMenuCheck{flex:none;color:var(--asc-ink-3)}',
      '.asc-branchMenuItem--current .asc-branchMenuCheck{color:var(--asc-accent-strong)}',
      '.asc-branchMenuMeta{font-size:10.5px;color:var(--asc-ink-3)}',
      '.asc-branchMenuHint{padding:2px 8px 6px}',
      '.asc-branchAction--busy{color:var(--asc-accent-strong)}',
      '.asc-branchBar--loading{pointer-events:none;user-select:none}',
      '.asc-branchPill--loading{position:relative;overflow:hidden;color:var(--asc-ink-3);background:var(--asc-surface);',
      'border-color:color-mix(in srgb,var(--asc-accent-strong) 30%,var(--asc-line));',
      'animation:asc-pill-breathe 1.6s ease-in-out infinite}',
      '.asc-storageWarn{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:10px;',
      'border:1px solid color-mix(in srgb,var(--asc-warn) 35%,transparent);background:color-mix(in srgb,var(--asc-warn) 10%,transparent);',
      'color:color-mix(in srgb,#7a4a00 90%,var(--asc-ink));font-size:12.5px;line-height:1.5}',
      '.asc-storageWarnIcon{flex:none;font-size:13px}',
      '.asc-indexChip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:999px;',
      'font-size:11px;line-height:1;color:var(--asc-ink-3);background:color-mix(in srgb,var(--asc-ink-3) 10%,transparent);',
      'border:1px solid transparent;white-space:nowrap}',
      // 就绪状态已由绿色 pill 表达，索引状态用中性描边，避免同一行出现两块绿色抢注意力
      '.asc-indexChip--ok{color:var(--asc-ink-2);background:transparent;border:1px solid var(--asc-line)}',
      '.asc-indexChip--ok .asc-icon{color:var(--asc-ok)}',
      // 索引 chip 可点：hover/focus 给出可交互反馈（点“更新索引/建立索引”直接触发）
      '.asc-indexChip--btn{appearance:none;font:inherit;cursor:pointer}',
      '.asc-indexChip--btn:hover{background:color-mix(in srgb,var(--asc-accent) 8%,transparent);border-color:var(--asc-accent)}',
      '.asc-indexChip--btn:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-sortSelect{max-width:150px;height:28px}',
      '.asc-indexChip--stale{color:var(--asc-warn);background:color-mix(in srgb,var(--asc-warn) 12%,transparent)}',
      // 索引覆盖要跑 codegraph status（冷启动约 4 秒）：先出脉冲骨架，别让页面空着
      '.asc-indexChip--loading{color:var(--asc-ink-3);background:transparent;border:1px dashed var(--asc-line);animation:ascChipPulse 1.4s ease-in-out infinite}',
      '.asc-indexChip--loading .asc-indexChipDot{width:6px;height:6px;border-radius:999px;background:currentColor;opacity:.7}',
      '@keyframes ascChipPulse{0%,100%{opacity:.55}50%{opacity:1}}',
      '.asc-indexChip--busy{color:var(--asc-accent-strong);background:color-mix(in srgb,var(--asc-accent-strong) 12%,transparent);',
      'animation:asc-pill-breathe 1.8s ease-in-out infinite}',
      '.asc-indexBird{display:inline-flex;width:12px;height:12px;align-items:center;justify-content:center}',
      '.asc-roleSkeleton{display:inline-flex;width:96px;height:28px;border-radius:8px;',
      'background:linear-gradient(100deg,color-mix(in srgb,var(--asc-ink-3) 8%,transparent) 18%,',
      'color-mix(in srgb,var(--asc-accent-strong) 14%,transparent) 50%,color-mix(in srgb,var(--asc-ink-3) 8%,transparent) 82%);',
      'background-size:220% 100%;animation:asc-shimmer 1.15s linear infinite}',
      '@keyframes asc-pill-breathe{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--asc-accent-strong) 0%,transparent)}50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--asc-accent-strong) 12%,transparent)}}',
      '.asc-branchPill--loading .asc-branchPillName{color:var(--asc-ink-3)}',
      '.asc-branchPill--loading::after{content:"";position:absolute;inset:0;pointer-events:none;',
      'background:linear-gradient(100deg,transparent 18%,color-mix(in srgb,var(--asc-accent-strong) 16%,transparent) 50%,transparent 82%);',
      'background-size:220% 100%;animation:asc-shimmer 1.15s linear infinite}',
      '@keyframes asc-shimmer{0%{background-position:120% 0}100%{background-position:-120% 0}}',
      '.asc-branchBird{display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;flex:none}',
      '.asc-branchProgress{position:absolute;left:0;right:0;bottom:-7px;height:2px;border-radius:999px;overflow:hidden;',
      'background:color-mix(in srgb,var(--asc-accent-strong) 16%,transparent)}',
      '.asc-branchProgressBar{position:absolute;top:0;bottom:0;width:38%;border-radius:999px;',
      'background:linear-gradient(90deg,transparent,var(--asc-accent-strong),transparent);',
      'animation:asc-progress-slide 1.15s ease-in-out infinite}',
      '@keyframes asc-progress-slide{0%{transform:translateX(-110%)}100%{transform:translateX(320%)}}',
      '.asc-branchBarHint--ok{display:inline-flex;align-items:center;gap:4px;color:var(--asc-ok);animation:asc-pop-in .22s cubic-bezier(.2,.8,.2,1) both}',
      '.asc-branchBarCheck{flex:none}',
      '@keyframes asc-pop-in{from{opacity:0;transform:translateY(2px) scale(.94)}to{opacity:1;transform:none}}',
      '.asc-switchLayer{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;',
      'background:color-mix(in srgb,var(--asc-ink) 22%,transparent);backdrop-filter:blur(3px);',
      'animation:asc-switch-fade .16s var(--asc-ease) both}',
      '.asc-switchCard{display:flex;flex-direction:column;align-items:center;gap:10px;padding:22px 30px;border-radius:14px;',
      'background:var(--asc-surface);border:1px solid var(--asc-line);box-shadow:0 20px 48px color-mix(in srgb,#0b1220 26%,transparent);',
      'animation:asc-switch-pop .2s cubic-bezier(.2,.8,.2,1) both}',
      '.asc-switchMark{position:relative;display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;margin-bottom:2px}',
      '.asc-switchRing{position:absolute;inset:0;border-radius:999px;border:1.5px dashed color-mix(in srgb,var(--asc-accent-strong) 34%,transparent);',
      'animation:asc-spin 7s linear infinite}',
      '.asc-switchBirdFloat{display:inline-flex;filter:drop-shadow(0 6px 12px color-mix(in srgb,var(--asc-accent-strong) 26%,transparent));',
      'animation:asc-switch-hover 1.9s ease-in-out infinite}',
      '@keyframes asc-switch-hover{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-5px) rotate(1.6deg)}}',
      '.asc-switchTitle{font-size:14px;font-weight:600;color:var(--asc-ink)}',
      '.asc-switchHint{font-size:12px;color:var(--asc-ink-3);max-width:260px;text-align:center}',
      '@keyframes asc-switch-fade{from{opacity:0}to{opacity:1}}',
      '@keyframes asc-switch-pop{from{opacity:0;transform:translateY(6px) scale(.985)}to{opacity:1;transform:none}}',
      '@media (prefers-reduced-motion: reduce){.asc-switchLayer,.asc-switchCard,.asc-switchMark,.asc-switchRing,.asc-switchBirdFloat{align-items:center} .asc-switchLayer,.asc-switchCard,.asc-switchMark .asc-bird,.asc-switchRing,.asc-switchBirdFloat,.asc-branchBird .asc-bird,.asc-branchProgressBar,.asc-branchBarHint--ok,.asc-branchPill--loading::after,.asc-branchPill--loading,.asc-roleSkeleton,.asc-loaderBird,.asc-loaderPulse,.asc-loaderOrbit,.asc-loaderBar,.asc-loaderBird .asc-bird,.asc-indexChip--busy,.asc-indexChip--loading,.asc-indexBird .asc-bird{animation:none !important}}',
      '.asc-branchBarState{font-size:11px;color:var(--asc-ink-3)}',
      '.asc-branchBarHint{font-size:11.5px;color:var(--asc-ink-3);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-branchMenu{position:absolute;left:0;bottom:calc(100% + 8px);z-index:60;min-width:220px;max-height:260px;overflow:auto;',
      'background:var(--asc-surface);border:1px solid var(--asc-line);border-radius:10px;padding:6px;',
      'box-shadow:0 12px 32px color-mix(in srgb,#0b1220 18%,transparent)}',
      '.asc-branchMenuList{display:flex;flex-direction:column;gap:2px}',
      '.asc-branchMenuItem{appearance:none;font:inherit;font-size:12.5px;display:flex;align-items:center;justify-content:space-between;gap:10px;',
      'padding:6px 8px;border:0;border-radius:6px;background:transparent;color:var(--asc-ink);cursor:pointer;text-align:left}',
      '.asc-branchMenuItem:hover{background:var(--asc-hover)}',
      '.asc-branchMenuItem:disabled{cursor:default;opacity:.6}',
      '.asc-branchMenuItem--current{background:var(--asc-hover)}',
      '.asc-branchMenuName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-branchMenuSearch{appearance:none;font:inherit;font-size:12.5px;width:100%;height:28px;padding:0 8px;margin:2px 0 4px;',
      'border:1px solid var(--asc-line);border-radius:7px;background:var(--asc-surface);color:var(--asc-ink);box-sizing:border-box}',
      '.asc-branchMenuSearch:focus{outline:none;border-color:var(--asc-accent)}',
      '.asc-branchMenuEmpty{padding:6px 8px;font-size:12px;color:var(--asc-ink-3)}',
      '.asc-branchSelect{max-width:280px;font-family:var(--asc-mono);font-size:12px;padding:6px 9px;width:auto}',
      '.asc-spaceBadge{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border:1px solid var(--asc-line);',
      'border-radius:7px;font-size:12px;line-height:1.2;color:var(--asc-ink-2);background:transparent;white-space:nowrap;',
      'font-family:var(--asc-mono);max-width:180px;overflow:hidden;text-overflow:ellipsis}',
      '.asc-markImg{border-radius:6px}',
      '.asc-homeSub{margin-top:3px;font-size:13px;color:var(--asc-ink-2);max-width:52ch}',
      '.asc-brand-name{appearance:none;border:0;background:transparent;padding:0;margin:0;color:inherit;font:inherit;',
      'font-size:15px;font-weight:600;letter-spacing:-.01em;line-height:1.3;white-space:nowrap;cursor:pointer;border-radius:6px}',
      '.asc-brand-name:hover{color:var(--asc-accent-strong)}',
      '.asc-brand-name:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '.asc-crumb{appearance:none;font:inherit;font-size:12px;line-height:1.2;display:inline-flex;align-items:center;gap:3px;',
      'padding:5px 9px 5px 6px;border:1px solid var(--asc-line);border-radius:7px;background:transparent;color:var(--asc-ink-2);',
      'cursor:pointer;white-space:nowrap;transition:background-color .12s var(--asc-ease),border-color .12s var(--asc-ease)}',
      '.asc-crumb:hover{background:var(--asc-hover);border-color:var(--asc-line-strong);color:var(--asc-ink)}',
      '.asc-crumb:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-name{font-size:15px;font-weight:600;letter-spacing:-.01em;line-height:1.35}',
      '.asc-desc{margin-top:2px;font-size:13px;line-height:1.5;color:var(--asc-ink-2);max-width:56ch}',
      '.asc-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--asc-ink-3)}',
      '.asc-path{font-family:var(--asc-mono);font-size:12px;color:var(--asc-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}',
      '.asc-hint{font-size:12px;color:var(--asc-ink-3)}',
      '.asc-hint--error{color:var(--asc-bad);font-size:12px}',
      '.asc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',
      /* ---- 状态 pill：背景由 currentColor 推导，明暗一致 ---- */
      '.asc-pill{display:inline-flex;align-items:center;gap:4px;border-radius:var(--asc-r-pill);padding:1px 8px;font-size:12px;line-height:1.6;',
      'color:var(--asc-accent-strong);background:color-mix(in srgb,var(--asc-accent) 10%,transparent)}',
      '.asc-pill--ready{color:var(--asc-ok);background:color-mix(in srgb,var(--asc-ok) 12%,transparent)}',
      '.asc-pill--unprepared{color:var(--asc-ink-2);background:color-mix(in srgb,var(--asc-ink-3) 14%,transparent)}',
      '.asc-pill--stale{color:var(--asc-warn);background:color-mix(in srgb,var(--asc-warn) 12%,transparent)}',
      '.asc-pill--failed,.asc-pill--warn{color:var(--asc-bad);background:color-mix(in srgb,var(--asc-bad) 10%,transparent)}',
      /* ---- 首页：项目卡片（签名元素） ---- */
      '.asc-homeGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}',
      '.asc-projCard{position:relative;display:flex;align-items:stretch;border:1px solid var(--asc-line);',
      'border-radius:var(--asc-r-card);background:var(--asc-surface);overflow:hidden;',
      'transition:border-color .12s var(--asc-ease),background-color .12s var(--asc-ease),transform .15s var(--asc-ease),box-shadow .15s var(--asc-ease)}',
      '.asc-projCard:hover{border-color:color-mix(in srgb,var(--asc-accent) 40%,var(--asc-line));background:var(--asc-surface-2);',
      'transform:translateY(-1px);box-shadow:0 6px 18px color-mix(in srgb,var(--asc-ink) 8%,transparent)}',
      '.asc-projCard:active{transform:translateY(0)}',
      '@media (prefers-reduced-motion: reduce){.asc-projCard:hover{transform:none}}',
      '.asc-projMain{appearance:none;font:inherit;color:inherit;text-align:left;cursor:pointer;background:transparent;border:0;',
      'flex:1;display:flex;gap:12px;align-items:flex-start;padding:14px;min-width:0}',
      '.asc-projMain:focus-visible{outline:2px solid var(--asc-accent);outline-offset:-2px;border-radius:var(--asc-r-card)}',
      '.asc-projGlyph{flex:none;width:32px;height:32px;border-radius:9px;display:grid;place-items:center;',
      'background:color-mix(in srgb,var(--asc-accent) 10%,transparent);color:var(--asc-accent-strong)}',
      '.asc-projBody{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}',
      // 计数用「数值大 + 单位小」的双色结构，比"3 个仓库 7 个分支空间"更有层次
      '.asc-projStats{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-top:2px;font-size:12px;color:var(--asc-ink-3)}',
      '.asc-projStat{display:inline-flex;align-items:baseline;gap:3px}',
      '.asc-projStat b{font-size:13.5px;font-weight:600;color:var(--asc-ink-2);font-variant-numeric:tabular-nums;letter-spacing:-.01em}',
      '.asc-projStatSep{color:var(--asc-line-strong)}',
      '.asc-projHead{display:flex;align-items:baseline;gap:8px;justify-content:space-between;min-width:0}',
      '.asc-projRecent{flex:none;font-size:11.5px;color:var(--asc-ink-3);white-space:nowrap}',
      '.asc-projName{font-size:14px;font-weight:600;letter-spacing:-.01em;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-aboutList{display:flex;flex-direction:column;gap:0;margin:12px 0 0;border:1px solid var(--asc-line);border-radius:var(--asc-r-card);overflow:hidden}',
      '.asc-aboutRow{display:flex;gap:16px;align-items:baseline;justify-content:space-between;padding:10px 14px;background:var(--asc-surface);font-size:12.5px}',
      '.asc-aboutRow + .asc-aboutRow{border-top:1px solid var(--asc-line)}',
      '.asc-aboutRow dt{color:var(--asc-ink-3);flex:none}',
      '.asc-aboutRow dd{margin:0;color:var(--asc-ink);font-weight:550;text-align:right;word-break:break-all}',
      '.asc-projManage{align-self:flex-start;margin:10px 10px 0 0;font-size:12px;padding:4px 8px;opacity:.6;transition:opacity .12s var(--asc-ease)}',
      '.asc-projCard:hover .asc-projManage,.asc-projManage:focus-visible{opacity:1}',
      /* ---- 分支空间列表 ---- */
      '.asc-rows{display:flex;flex-direction:column;border:1px solid var(--asc-line);border-radius:var(--asc-r-card);overflow:hidden}',
      '.asc-spaceRow{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 14px;background:var(--asc-surface);',
      'animation:asc-row-in .26s var(--asc-ease) both;transition:background-color .15s var(--asc-ease)}',
      '.asc-spaceRow + .asc-spaceRow{border-top:1px solid var(--asc-line)}',
      '.asc-spaceRow:hover{background:var(--asc-surface-2)}',
      '.asc-spaceMain{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 240px}',
      '.asc-spaceName{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.asc-spaceName .asc-branchName{font-size:13.5px;font-weight:550}',
      '.asc-spaceActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;position:relative}',
      '.asc-spaceTools{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0 14px;',
      'position:sticky;top:0;z-index:6;background:var(--asc-surface)}',
      '.asc-search{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;border:1px solid var(--asc-line);',
      'border-radius:9px;background:var(--asc-surface);color:var(--asc-ink-3);flex:1 1 200px;max-width:280px;',
      'transition:border-color .15s var(--asc-ease),box-shadow .15s var(--asc-ease)}',
      '.asc-search:focus-within{border-color:var(--asc-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--asc-accent) 16%,transparent)}',
      '.asc-searchInput{appearance:none;border:0;background:transparent;font:inherit;font-size:13px;color:var(--asc-ink);outline:none;width:100%}',
      '.asc-searchInput::placeholder{color:var(--asc-ink-3)}',
      '.asc-filterChip--sort{border-style:dashed}',
      '.asc-toolsLabel{font-size:11px;color:var(--asc-ink-3);margin-left:2px}',
      '.asc-spaceRow--compact{padding:9px 14px;cursor:pointer}',
      '.asc-spaceRow--compact .asc-spaceMain{gap:2px}',
      '.asc-spaceAge{font-size:11.5px;color:var(--asc-ink-3)}',
      // 默认 ghost：有边框所以看得出可点；行 hover/聚焦时升为主色，避免 7 个蓝块同时抢注意力
      '.asc-spaceEnter{padding:6px 12px;font-size:12.5px;border-color:var(--asc-line-strong);color:var(--asc-ink-2);',
      'transition:background-color .14s var(--asc-ease),border-color .14s var(--asc-ease),color .14s var(--asc-ease)}',
      '.asc-spaceEnter .asc-icon{color:var(--asc-ink-3);transition:color .14s var(--asc-ease)}',
      '.asc-spaceRow:hover .asc-spaceEnter .asc-icon{color:#fff}',
      // 默认安静，行 hover/键盘聚焦时才升为主色：7 个蓝块同时出现会把注意力扯碎
      '.asc-spaceRow:hover .asc-spaceEnter,.asc-spaceRow:focus-within .asc-spaceEnter{background:' + ACCENT_STRONG + ';border-color:' + ACCENT_STRONG + ';color:#fff}',
      '.asc-spaceRow:hover .asc-spaceEnter .asc-icon,.asc-spaceRow:focus-within .asc-spaceEnter .asc-icon{color:#fff}',
      '.asc-iconBtn--more svg{opacity:.75}',
      '.asc-iconBtn--open{border-color:var(--asc-accent);color:var(--asc-ink);background:var(--asc-hover)}',
      '.asc-spaceMenu{position:absolute;z-index:120;min-width:186px;display:flex;flex-direction:column;gap:2px;',
      'padding:6px;border:1px solid var(--asc-line);border-radius:10px;background:var(--asc-surface);',
      'box-shadow:0 16px 36px color-mix(in srgb,#0b1220 20%,transparent);animation:asc-pop-in .16s var(--asc-ease) both}',
      '.asc-spaceMenuItem{appearance:none;font:inherit;font-size:12.5px;display:flex;align-items:center;gap:8px;width:100%;',
      'padding:7px 9px;border:0;border-radius:7px;background:transparent;color:var(--asc-ink);cursor:pointer;text-align:left;',
      'transition:background-color .12s var(--asc-ease)}',
      '.asc-spaceMenuItem:hover{background:var(--asc-hover)}',
      '.asc-spaceMenuItem:focus-visible{outline:2px solid var(--asc-accent);outline-offset:1px}',
      '.asc-spaceMenuItem--danger{color:var(--asc-bad)}',
      '.asc-spaceMenuItem--danger:hover{background:color-mix(in srgb,var(--asc-bad) 9%,transparent)}',
      '.asc-spaceGroup + .asc-spaceGroup{margin-top:16px}',
      '.asc-spaceGroupHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 2px 6px}',
      '.asc-spaceGroupTitle{font-size:12px;font-weight:600;color:var(--asc-ink-2);letter-spacing:.02em;font-family:var(--asc-mono)}',
      /* ---- 分支分组 ---- */
      '.asc-groups{display:flex;flex-direction:column;gap:16px;max-height:46vh;overflow:auto;padding-right:4px}',
      '.asc-group{display:flex;flex-direction:column;gap:7px}',
      '.asc-groupTitle{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--asc-ink-3);',
      'font-family:var(--asc-mono);position:sticky;top:0;background:var(--asc-surface);padding:2px 0;z-index:1}',
      '.asc-groupCount{border-radius:var(--asc-r-pill);background:color-mix(in srgb,var(--asc-ink-3) 14%,transparent);padding:0 7px;font-size:11px}',
      /* ---- 分组区块（项目管理） ---- */
      '.asc-section{display:flex;flex-direction:column;gap:10px;padding:16px;border:1px solid var(--asc-line);border-radius:var(--asc-r-card);background:var(--asc-surface)}',
      '.asc-sectionHead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
      '.asc-sectionTitle{margin:0;font-size:13px;font-weight:600;letter-spacing:0;color:var(--asc-ink)}',
      '.asc-section--danger{border-color:color-mix(in srgb,var(--asc-bad) 28%,var(--asc-line));background:color-mix(in srgb,var(--asc-bad) 4%,var(--asc-surface))}',
      /* ---- 分支选择 ---- */
      '.asc-searchRow{display:flex;gap:10px;align-items:center}',
      '.asc-branchGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:7px}',
      '.asc-branchRow{appearance:none;font:inherit;color:inherit;cursor:pointer;display:flex;align-items:center;gap:8px;justify-content:space-between;',
      'padding:9px 12px;border:1px solid var(--asc-line);border-radius:var(--asc-r-ctl);background:var(--asc-surface);',
      'transition:border-color .12s var(--asc-ease),background-color .12s var(--asc-ease),transform .12s var(--asc-ease)}',
      '.asc-branchRow:hover{border-color:color-mix(in srgb,var(--asc-accent) 45%,var(--asc-line));background:var(--asc-surface-2)}',
      '.asc-branchRow:active{transform:translateY(1px)}',
      '.asc-branchRow:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-branchRow--active{border-color:var(--asc-accent-strong);background:color-mix(in srgb,var(--asc-accent) 7%,transparent)}',
      '.asc-branchName{font-family:var(--asc-mono);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-homeFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;',
      'padding-top:18px;border-top:1px solid var(--asc-line)}',
      /* ---- 管理面 ---- */
      '.asc-panel{display:flex;flex-direction:column;gap:16px;max-width:920px;color:var(--asc-ink)}',
      '.asc-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.asc-title{margin:0;font-size:18px;font-weight:600;letter-spacing:-.015em;line-height:1.3}',
      '.asc-sub{margin:3px 0 0;font-size:13px;line-height:1.5;color:var(--asc-ink-2)}',
      '.asc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}',
      '.asc-card{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--asc-line);',
      'border-radius:var(--asc-r-card);background:var(--asc-card)}',
      '.asc-cardHead{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}',
      '.asc-branches{display:flex;flex-wrap:wrap;gap:6px}',
      '.asc-branch{appearance:none;font:inherit;font-size:12px;border:1px solid var(--asc-line);background:var(--asc-surface);',
      'border-radius:var(--asc-r-pill);padding:2px 10px;cursor:pointer;color:var(--asc-ink-2);line-height:1.7}',
      '.asc-branch:hover:not(:disabled){border-color:var(--asc-accent);color:var(--asc-accent-strong)}',
      '.asc-branch:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-branch[data-current="true"]{background:var(--asc-accent-strong);border-color:var(--asc-accent-strong);color:#fff;cursor:default}',
      '.asc-branch--remote{background:transparent;border-style:dashed;cursor:default;color:var(--asc-ink-3)}',
      '.asc-form{display:flex;flex-direction:column;gap:12px;padding:14px;border:1px solid var(--asc-line);',
      'border-radius:var(--asc-r-card);background:var(--asc-surface-2)}',
      '.asc-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}',
      '.asc-choice{display:inline-flex;gap:6px;align-items:center;font-size:12.5px;cursor:pointer;color:var(--asc-ink-2)}',
      '.asc-field{display:flex;flex-direction:column;gap:5px;min-width:0}',
      '.asc-row > .asc-field{flex:1 1 260px}',
      '.asc-label{font-size:12px;color:var(--asc-ink-2)}',
      '.asc-list{display:flex;flex-direction:column;gap:10px;position:relative}',
      '.asc-members{display:flex;flex-direction:column;border:1px solid var(--asc-line);border-radius:var(--asc-r-card);overflow:hidden}',
      '.asc-member{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:11px 14px;background:var(--asc-card)}',
      '.asc-member + .asc-member{border-top:1px solid var(--asc-line)}',
      '.asc-memberMain{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 220px}',
      '.asc-memberSide{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '.asc-detail{display:flex;flex-direction:column;gap:14px}',
      '.asc-detailHead{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}',
      /* ---- 反馈态 ---- */
      /* 宿主的视图选项（排序/过滤）按钮：项目顺序由项目管理决定，去掉该入口 */
      'button[aria-label="视图选项"]{display:none !important}',
      /* 分支分组行：收起箭头、宿主的工作区操作菜单、工作区级新建按钮一律隐藏
         —— 分支不可收起；重命名/删除由 Ascoder 项目管理负责；新建会话走顶部入口 */
      '[role="treeitem"][data-row-key^="workspace:"] [class*="chevron"]{display:none !important}',
      'button[aria-label^="工作区"][aria-label$="的操作"],button[aria-label^="项目"][aria-label$="的操作"]{display:none !important}',
      'button[aria-label^="在“"][aria-label$="”中新建会话"]{display:none !important}',
      /* hero 标题旁的「预览版/Ascoder」徽章与标题重复，隐藏 */
      '[class*="previewBadge"]{display:none !important}',
      /* 首页大标题旁的预设预览徽章：Ascoder 用不到 */
      '[class*="headline"] [class*="previewBadge"]{display:none !important}',
      /* 会话里不提供模型选择：模型在设置页配置 */
      'button[aria-label^="选择模型"]{display:none !important}',
      /* 访问模式固定为只读：会话页不提供切换入口 */
      'button[aria-label^="访问模式"]{display:none !important}',
      /* /permission 指令仍会弹选择器，一并隐藏 */
      '[class*="permissionPopover"],[class*="permissionMenu"],[class*="permissionDialog"]{display:none !important}',
      /* 运行状态：鲸鱼是 mask 动画的 span，逐字 shimmer 文本替换不了，这里整体替换 */
      '[data-chat-running] [class*="runningIcon"]{display:none !important}',
      '[data-chat-running] [class*="runningText"]{display:none !important}',
      /* 小鸟：扇翅 + 轻微浮动；拖尾：左后方渐变尾巴 */
      '@keyframes asc-bird-fly{',
      '0%{transform:translateY(0) rotate(-4deg) scaleY(1)}',
      '18%{transform:translateY(-2.6px) rotate(1.5deg) scaleY(1.09)}',
      '42%{transform:translateY(-1.2px) rotate(4deg) scaleY(.93)}',
      '68%{transform:translateY(-2.2px) rotate(-1.5deg) scaleY(1.06)}',
      '100%{transform:translateY(0) rotate(-4deg) scaleY(1)}}',
      '@keyframes asc-bird-glow{0%,100%{filter:drop-shadow(0 0 0 rgba(56,189,248,0))}',
      '50%{filter:drop-shadow(0 0 4px rgba(56,189,248,.45))}}',
      '@keyframes asc-trail{0%{opacity:0;transform:translateX(0) scaleX(.45)}30%{opacity:.8;transform:translateX(-2px) scaleX(1.15)}',
      '65%{opacity:.35;transform:translateX(-5px) scaleX(1.55)}100%{opacity:0;transform:translateX(-8px) scaleX(1.85)}}',
      '@keyframes asc-label-flow{0%{background-position:0% 50%}100%{background-position:200% 50%}}',
      '.asc-bird-trail{display:inline-block;width:11px;height:9px;margin-right:-5px;vertical-align:-1px;',
      'background:linear-gradient(90deg,rgba(226,74,51,0),rgba(226,74,51,.55) 45%,rgba(31,99,224,.45) 75%,rgba(31,99,224,0));',
      'border-radius:999px;filter:blur(1.3px);transform-origin:100% 50%;',
      'animation:asc-trail 1.25s ease-in-out infinite,asc-bird-glow 2.5s ease-in-out infinite}',
      '.asc-bird-icon{display:inline-block;width:15px;height:15px;margin-right:6px;vertical-align:-2px;',
      'background:url("' + ASC_BIRD_SVG_URI + '") center/contain no-repeat;',
      'animation:asc-bird-fly 1.25s ease-in-out infinite,asc-bird-glow 2.5s ease-in-out infinite,',
      'asc-float-tiny 3.2s ease-in-out infinite;transform-origin:50% 70%;will-change:transform,filter}',
      /* 文案：取 logo 的珊瑚→琥珀→青→蓝→紫渐变，并缓慢流动 */
      '[data-chat-running] [class*="runningContent"]::after{content:attr(data-asc-running);font-size:13px;line-height:1.4;',
      'white-space:nowrap;background-image:linear-gradient(90deg,#E24A33 0%,#B8720A 22%,#0C8B7C 44%,#1F63E0 66%,#6633CC 84%,#E24A33 100%);',
      'background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;',
      'animation:asc-label-flow 2.8s cubic-bezier(.4,0,.6,1) infinite;will-change:background-position}',
      '@media (prefers-reduced-motion: reduce){',
      '.asc-bird-icon,.asc-bird-trail,[data-chat-running] [class*="runningContent"]::after{animation:none !important}',
      '.asc-homeInner{animation:none !important}',
      '.asc-bird-trail{opacity:.35}',
      '}',
      '.asc-rolePick{appearance:none;font:inherit;color:inherit;text-align:left;cursor:pointer;background:transparent;border:0;',
      'display:flex;align-items:center;gap:8px;flex:1;padding:0;min-width:0;flex-wrap:wrap}',
      '.asc-rolePick:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px;border-radius:6px}',
      '.asc-rolePick--active .asc-name{color:var(--asc-accent-strong)}',
      '.asc-textarea{font-family:var(--asc-font);line-height:1.5;resize:vertical;min-height:96px}',
      '.asc-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.asc-btn--sm{padding:3px 8px;font-size:12px}',
      '.asc-taskRow{display:flex;flex-direction:column;gap:8px;padding:12px 14px;background:var(--asc-surface);animation:asc-row-in .26s var(--asc-ease) both}',
      '.asc-taskBird{display:inline-flex;align-items:center;flex:none}',
      '.asc-taskRow + .asc-taskRow{border-top:1px solid var(--asc-line)}',
      '.asc-taskElapsed{margin-left:auto;font-size:11.5px;color:var(--asc-ink-3);font-variant-numeric:tabular-nums}',
      '.asc-taskSpent{flex:none;font-size:11.5px;color:var(--asc-ink-3);font-variant-numeric:tabular-nums;min-width:52px;text-align:right}',
      '.asc-taskHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.asc-taskHead .asc-btn--danger{margin-left:auto}',
      '.asc-progress{height:6px;border-radius:999px;background:color-mix(in srgb,var(--asc-ink-3) 16%,transparent);overflow:hidden}',
      '.asc-progressBar{height:100%;border-radius:999px;background:var(--asc-accent-strong);transition:width .3s var(--asc-ease)}',
      '.asc-eventRow{display:flex;align-items:center;gap:10px;padding:8px 14px;font-size:12.5px;background:var(--asc-surface)}',
      '.asc-eventRow + .asc-eventRow{border-top:1px solid var(--asc-line)}',
      '.asc-taskHistoryRow{background:var(--asc-surface)}',
      '.asc-filters{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}',
      '.asc-filterChip{appearance:none;font:inherit;font-size:12px;line-height:1.4;padding:3px 10px;border-radius:999px;',
      'border:1px solid var(--asc-line);background:transparent;color:var(--asc-ink-2);cursor:pointer;',
      'transition:background-color .12s var(--asc-ease),border-color .12s var(--asc-ease),color .12s var(--asc-ease)}',
      '.asc-filterChip:hover{background:var(--asc-hover);color:var(--asc-ink)}',
      '.asc-filterChip:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-filterChip--active{background:var(--asc-accent-strong);border-color:var(--asc-accent-strong);color:#fff}',
      '.asc-filterChip--active:hover{background:var(--asc-accent-strong);color:#fff}',
      '.asc-pager{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--asc-line)}',
      '.asc-eventTime{color:var(--asc-ink-3);flex:none;width:72px}',
      '.asc-eventType{flex:none;color:var(--asc-ink);font-weight:500}',
      '.asc-eventBody{flex:1;min-width:0;color:var(--asc-ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-groupLabel{font-size:11.5px;letter-spacing:.02em;text-transform:uppercase;color:var(--asc-ink-3);padding:2px 2px 6px}',
      '.asc-roleList{display:flex;flex-direction:column;border:1px solid var(--asc-line);border-radius:var(--asc-r-card);overflow:hidden;background:var(--asc-surface)}',
      '.asc-roleRow + .asc-roleRow{border-top:1px solid var(--asc-line)}',
      '.asc-roleHead{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;padding:12px 14px}',
      '.asc-roleText{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 240px}',
      '.asc-roleDetail{display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;border-top:1px dashed var(--asc-line);background:var(--asc-surface-2)}',
      '.asc-roleField{display:flex;flex-direction:column;gap:3px}',
      '.asc-roleValue{font-size:12.5px;color:var(--asc-ink-2)}',
      '.asc-rolePrompt{margin:0;font-family:var(--asc-mono);font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;',
      'color:var(--asc-ink-2);background:var(--asc-surface);border:1px solid var(--asc-line);border-radius:8px;padding:8px 10px;max-height:190px;overflow:auto}',
      '.asc-rolePickWrap{position:relative;display:inline-flex}',
      '.asc-roleChip{appearance:none;font:inherit;font-size:12px;line-height:1.2;display:inline-flex;align-items:center;gap:5px;padding:5px 9px;',
      'border:1px solid var(--asc-line);border-radius:7px;background:transparent;color:var(--asc-ink-2);cursor:pointer;white-space:nowrap}',
      '.asc-roleChip:hover{background:var(--asc-hover);color:var(--asc-ink);border-color:var(--asc-line-strong)}',
      '.asc-roleChip:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-roleMenu{position:absolute;bottom:calc(100% + 6px);left:0;z-index:40;min-width:280px;display:flex;flex-direction:column;gap:2px;',
      'padding:6px;background:var(--asc-surface);border:1px solid var(--asc-line);border-radius:10px;',
      'box-shadow:0 12px 32px color-mix(in srgb,var(--asc-ink) 18%,transparent)}',
      '.asc-roleMenuItem{appearance:none;font:inherit;color:inherit;text-align:left;cursor:pointer;display:flex;flex-wrap:wrap;align-items:center;gap:6px;',
      'padding:8px 9px;border:0;border-radius:7px;background:transparent}',
      '.asc-roleMenuItem:hover{background:var(--asc-hover)}',
      '.asc-roleMenuItem:focus-visible{outline:2px solid var(--asc-accent);outline-offset:-2px}',
      '.asc-roleMenuItem--active{background:color-mix(in srgb,var(--asc-accent) 8%,transparent)}',
      '.asc-roleMenuName{font-size:13px;font-weight:500}',
      '.asc-roleMenuDesc{flex-basis:100%;font-size:11.5px;color:var(--asc-ink-3)}',
      '.asc-ok{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 12px;border-radius:var(--asc-r-ctl);',
      'border:1px solid color-mix(in srgb,var(--asc-ok) 32%,var(--asc-line));background:color-mix(in srgb,var(--asc-ok) 8%,transparent);',
      'color:var(--asc-ok);font-size:12.5px}',
      '.asc-error{display:flex;flex-wrap:wrap;min-width:0;gap:10px;align-items:center;padding:10px 12px;border-radius:var(--asc-r-ctl);',
      'border:1px solid color-mix(in srgb,var(--asc-bad) 32%,var(--asc-line));background:color-mix(in srgb,var(--asc-bad) 7%,transparent);',
      'color:var(--asc-bad);font-size:12.5px}',
      '.asc-empty{display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:22px;border:1px dashed var(--asc-line-strong);',
      'border-radius:var(--asc-r-card);color:var(--asc-ink-2);font-size:13px;line-height:1.6}',
      '.asc-skeleton{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}',
      '.asc-homeLoader{display:flex;flex-direction:column;align-items:center;gap:8px;padding:34px 20px 26px;width:100%}',
      '.asc-loaderScene{position:relative;display:flex;align-items:center;justify-content:center;width:136px;height:136px;margin-bottom:4px}',
      '.asc-loaderBird{position:relative;z-index:2;display:inline-flex;filter:drop-shadow(0 10px 18px color-mix(in srgb,var(--asc-accent-strong) 30%,transparent));',
      'animation:asc-loader-float 2.6s ease-in-out infinite}',
      '.asc-loaderPulse{position:absolute;inset:20px;border-radius:999px;border:1.5px solid color-mix(in srgb,var(--asc-accent-strong) 32%,transparent);',
      'animation:asc-loader-ping 2.6s ease-out infinite}',
      '.asc-loaderPulse--delayed{animation-delay:1.3s}',
      '.asc-loaderOrbit{position:absolute;inset:8px;animation:asc-spin 7s linear infinite}',
      '.asc-loaderDot{position:absolute;top:-2px;left:50%;margin-left:-3px;width:6px;height:6px;border-radius:999px;background:var(--asc-accent-strong);',
      'box-shadow:0 0 10px color-mix(in srgb,var(--asc-accent-strong) 62%,transparent)}',
      '@keyframes asc-loader-float{0%,100%{transform:translateY(-3px) rotate(-2deg)}50%{transform:translateY(4px) rotate(2deg)}}',
      '@keyframes asc-loader-ping{0%{transform:scale(.72);opacity:.78}70%{opacity:0}100%{transform:scale(1.2);opacity:0}}',
      '.asc-loaderTitle{font-size:14px;font-weight:600;color:var(--asc-ink)}',
      '.asc-loaderHint{font-size:12px;color:var(--asc-ink-3)}',
      '.asc-loaderBars{display:flex;gap:6px;margin-top:8px}',
      '.asc-loaderBar{width:26px;height:3px;border-radius:999px;background:color-mix(in srgb,var(--asc-accent-strong) 26%,transparent);',
      'animation:asc-loader-bar 1.2s ease-in-out infinite}',
      '.asc-loaderBar:nth-child(2){animation-delay:.16s}',
      '.asc-loaderBar:nth-child(3){animation-delay:.32s}',
      '@keyframes asc-loader-bar{0%,100%{opacity:.32;transform:scaleX(.68)}50%{opacity:1;transform:scaleX(1)}}',
      '.asc-toolGroup + .asc-toolGroup{margin-top:16px}',
      '.asc-toolRow{display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border:1px solid var(--asc-line);',
      'border-radius:10px;background:var(--asc-surface)}',
      '.asc-toolRow + .asc-toolRow{margin-top:8px}',
      '.asc-knSearch{display:flex;gap:8px;align-items:center;margin:8px 0 12px;flex-wrap:wrap}',
      '.asc-knScope{font-size:10.5px;padding:1px 6px;border-radius:999px;background:color-mix(in srgb,var(--asc-accent-strong) 12%,transparent);color:var(--asc-accent-strong);white-space:nowrap}',
      '.asc-knDefinition{font-size:12px;line-height:1.55;color:var(--asc-ink-3);white-space:pre-wrap;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}',
      // 展开后不再截断；长正文默认只显示 3 行，避免 45 条把设置页拉得很长
      '.asc-knDefinition--open{display:block;-webkit-line-clamp:unset;overflow:visible}',
      '.asc-knMore{appearance:none;font:inherit;font-size:11.5px;color:var(--asc-accent-strong);background:transparent;border:0;padding:2px 0 0;cursor:pointer}',
      '.asc-knMore:hover{text-decoration:underline}',
      '.asc-knMore:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-knFilters{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 12px}',
      '.asc-knUnused{margin-left:auto;font-size:11.5px;color:var(--asc-warn)}',
      '.asc-knConfirm{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;margin:0 0 12px;border-radius:10px;',
      'border:1px solid color-mix(in srgb,var(--asc-warn) 40%,transparent);background:color-mix(in srgb,var(--asc-warn) 8%,transparent);font-size:12px}',
      '.asc-knConfirmText{flex:1;min-width:180px;color:var(--asc-ink-2)}',
      // 「开启通知」引导卡：固定在右下角，只在会话页出现，普通用户无需管理密码即可开启
      '.asc-notifyGuide{position:fixed;right:24px;bottom:118px;z-index:80;width:min(340px,calc(100vw - 48px));',
      'display:flex;gap:11px;padding:14px 15px;border-radius:14px;background:var(--asc-surface);',
      'border:1px solid color-mix(in srgb,var(--asc-accent) 30%,var(--asc-line));',
      'box-shadow:0 12px 32px color-mix(in srgb,var(--asc-ink) 16%,transparent);',
      'animation:asc-guide-in .22s var(--asc-ease) both}',
      '@keyframes asc-guide-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '.asc-notifyGuideIcon{flex:none;width:28px;height:28px;border-radius:999px;display:inline-flex;align-items:center;',
      'justify-content:center;background:color-mix(in srgb,var(--asc-accent) 14%,transparent);color:var(--asc-accent-strong)}',
      '.asc-notifyGuideBody{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}',
      '.asc-notifyGuideTitle{font-size:13px;font-weight:600;color:var(--asc-ink)}',
      '.asc-notifyGuideText{font-size:12px;line-height:1.5;color:var(--asc-ink-3)}',
      '.asc-notifyGuideActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '.asc-notifyGuideLink{appearance:none;font:inherit;font-size:11.5px;color:var(--asc-ink-3);background:transparent;',
      'border:0;padding:2px 0;cursor:pointer;text-decoration:underline;margin-left:auto}',
      '.asc-notifyGuideLink:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-notifyGuideClose{appearance:none;border:0;background:transparent;color:var(--asc-ink-3);font-size:14px;',
      'line-height:1;padding:2px 4px;cursor:pointer;flex:none;align-self:flex-start}',
      '.asc-notifyGuideClose:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      // 全局任务进度：任何页面都能看到正在跑的任务（右下角，可展开/取消）
      '.asc-taskDock{position:fixed;right:24px;bottom:24px;z-index:85;width:min(360px,calc(100vw - 48px));',
      'border-radius:14px;background:var(--asc-surface);border:1px solid var(--asc-line-strong);',
      'box-shadow:0 14px 36px color-mix(in srgb,var(--asc-ink) 18%,transparent);overflow:hidden;',
      'animation:asc-guide-in .22s var(--asc-ease) both}',
      '.asc-taskDockHead{display:flex;align-items:center;gap:9px;padding:11px 13px;cursor:pointer;background:transparent;border:0;',
      'width:100%;font:inherit;color:inherit;text-align:left}',
      '.asc-taskDockHead:hover{background:var(--asc-hover)}',
      '.asc-taskDockHead:focus-visible{outline:2px solid var(--asc-accent);outline-offset:-2px}',
      '.asc-taskDockTitle{flex:1;min-width:0;font-size:12.5px;font-weight:550;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-taskDockMeta{flex:none;font-size:11.5px;color:var(--asc-ink-3);font-variant-numeric:tabular-nums}',
      '.asc-taskDockBar{height:3px;background:color-mix(in srgb,var(--asc-ink-3) 18%,transparent)}',
      '.asc-taskDockFill{height:100%;background:var(--asc-accent-strong);transition:width .4s var(--asc-ease)}',
      '.asc-taskDockList{display:flex;flex-direction:column;border-top:1px solid var(--asc-line);max-height:44vh;overflow:auto}',
      '.asc-taskDockRow{display:flex;align-items:center;gap:8px;padding:9px 13px;font-size:12px;background:var(--asc-surface)}',
      '.asc-taskDockRow + .asc-taskDockRow{border-top:1px solid var(--asc-line)}',
      '.asc-taskDockRowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
      '.asc-taskDockRowName{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-taskDockRowMsg{font-size:11px;color:var(--asc-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-taskDockDone{display:flex;align-items:center;gap:7px;padding:10px 13px;font-size:12px;color:var(--asc-ok)}',
      '.asc-taskDockMore{border-top:1px solid var(--asc-line)}',
      '.asc-taskDockLink{display:block;width:100%;padding:9px 13px;background:transparent;border:0;font:inherit;font-size:11.5px;',
      'color:var(--asc-accent-strong);cursor:pointer;text-align:center}',
      '.asc-taskDockLink:hover{background:var(--asc-hover)}',
      '.asc-taskDockLink:focus-visible{outline:2px solid var(--asc-accent);outline-offset:-2px}',
      '@media (prefers-reduced-motion: reduce){.asc-taskDock{animation:none} .asc-taskDockFill{transition:none}}',
      '@media (prefers-reduced-motion: reduce){.asc-notifyGuide{animation:none}}',
      '.asc-toolMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
      '.asc-toolName{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-family:var(--asc-mono);font-size:12.5px;font-weight:600;color:var(--asc-ink)}',
      '.asc-toolDesc{font-size:12px;color:var(--asc-ink-3);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      '.asc-toolStats{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--asc-ink-3)}',
      '.asc-toolErr{font-size:11.5px;color:var(--asc-bad);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-toolSide{display:flex;align-items:center;gap:8px;flex:none}',
      '.asc-toolBadge{font-size:10.5px;padding:1px 6px;border-radius:999px;background:color-mix(in srgb,var(--asc-bad) 12%,transparent);color:var(--asc-bad)}',
      '.asc-cliCard{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--asc-line);border-radius:10px;background:var(--asc-card);margin:6px 0 2px}',
      '.asc-cliHead{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.asc-cliTitle{font-size:12.5px;font-weight:600;color:var(--asc-ink)}',
      '.asc-cliRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px}',
      '.asc-cliDot{width:7px;height:7px;border-radius:999px;background:color-mix(in srgb,var(--asc-ink-3) 55%,transparent);flex:none}',
      '.asc-cliDot--ok{background:var(--asc-ok)}',
      '.asc-cliName{font-family:var(--asc-mono);font-weight:600;color:var(--asc-ink)}',
      '.asc-cliState{color:var(--asc-ink-3);font-size:11.5px;margin-left:auto;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.asc-cliState--off{color:var(--asc-bad)}',
      '.asc-switch{appearance:none;position:relative;flex:none;width:38px;height:22px;border-radius:999px;border:1px solid var(--asc-line);',
      'background:color-mix(in srgb,var(--asc-ink-3) 20%,transparent);cursor:pointer;',
      'transition:background-color .16s var(--asc-ease),border-color .16s var(--asc-ease)}',
      '.asc-switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:999px;background:#fff;',
      'box-shadow:0 1px 3px rgba(11,18,32,.28);transition:transform .16s var(--asc-ease)}',
      '.asc-switch[aria-checked="true"]{background:var(--asc-accent-strong);border-color:var(--asc-accent-strong)}',
      '.asc-switch[aria-checked="true"]::after{transform:translateX(16px)}',
      '.asc-switch:disabled{opacity:.6;cursor:default}',
      '.asc-switch:focus-visible{outline:2px solid var(--asc-accent);outline-offset:2px}',
      '.asc-skelCard{height:96px;border-radius:var(--asc-r-card);border:1px solid var(--asc-line);background:var(--asc-card);opacity:.7}',
      /* ---- 密码门 ---- */
      '.asc-gate{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:24px;',
      'background:color-mix(in srgb,var(--asc-ink) 42%,transparent);backdrop-filter:blur(2px)}',
      '.asc-gateCard{width:100%;max-width:360px;display:flex;flex-direction:column;gap:12px;padding:22px;',
      'border-radius:14px;background:var(--asc-surface);border:1px solid var(--asc-line);',
      'box-shadow:0 18px 48px color-mix(in srgb,var(--asc-ink) 22%,transparent)}',
      '.asc-gateTitle{font-size:16px;font-weight:600;letter-spacing:-.01em}',
      /* ---- 暗色：语义色提亮，保证 4.5:1 以上 ----
       * DSH 的主题是「body[data-ds-dark-theme]」（固定深色）或系统偏好（system）两种来源，
       * 只写 prefers-color-scheme 会在用户手动选深色/浅色时失配，所以两条都覆盖。 */
      DARK_TOKENS_SELECTOR + '{',
      '--asc-ok:#5CD68A;--asc-warn:#F0A646;--asc-bad:#FF8A80;',
      '--asc-accent-strong:#8FA5FF;--asc-accent:#8FA5FF;',
      '--asc-ink-3:#A9AEB4;',
      '}',
      // 注意：DARK_TOKENS_SELECTOR 是逗号列表，拼后代选择器必须用 :is() 包住，
      // 否则 background 会作用到列表里每个表面元素（曾导致深色首页整片变品牌蓝）。
      ':is(' + DARK_TOKENS_SELECTOR + ') .asc-btn--primary{background:' + ACCENT + ';border-color:' + ACCENT + ';color:#0B0D12}',
      ':is(' + DARK_TOKENS_SELECTOR + ') .asc-btn--primary:hover:not(:disabled){background:' + ACCENT_STRONG + ';border-color:' + ACCENT_STRONG + ';color:#fff}',
      ':is(' + DARK_TOKENS_SELECTOR + ') .asc-branch[data-current="true"]{background:' + ACCENT + ';border-color:' + ACCENT + ';color:#0B0D12}',
      ':is(' + DARK_TOKENS_SELECTOR + ') .asc-branchRow--active{border-color:#8FA5FF}',
      /* 系统深色（且用户没有强制浅色）时同样生效 */
      '@media (prefers-color-scheme: dark){',
      'html:not([data-ds-theme-source="light"]):not([data-ds-theme-source="dark"]) ' + ASC_SURFACE_SELECTOR.replaceAll(',', ', html:not([data-ds-theme-source="light"]):not([data-ds-theme-source="dark"]) ') + '{',
      '--asc-ok:#5CD68A;--asc-warn:#F0A646;--asc-bad:#FF8A80;',
      '--asc-accent-strong:#8FA5FF;--asc-accent:#8FA5FF;',
      '}',
      '}',
      /* ---- 动效降级 ---- */
      '@media (prefers-reduced-motion: reduce){.asc-home *,.asc-panel *,.asc-gate *{transition:none !important;animation:none !important}}',
      '@media (prefers-reduced-motion: reduce){.asc-spaceRow,.asc-icon,.asc-iconBtn,.asc-btn--lead,.asc-spaceMenu{animation:none !important;transition:none !important}}',
    ].join('\n')

    /** 品牌 token 覆盖：把宿主的蓝色系换成 Ascoder 品牌蓝。 */
    var BRAND_CSS = ':root{--dsw-alias-brand-primary:' + ACCENT + ';--dsw-alias-button-primary-fill:' + ACCENT + ';--dsw-alias-button-primary-hover:' + ACCENT_STRONG + ';--dsw-alias-link:' + ACCENT + '}'

    /** 注入一次性样式标签。 */
    function ensureStyle(id, text, plugin) {
      if (typeof document === 'undefined') return
      var existing = document.querySelector('style[data-plugin-css="' + id + '"]')
      if (existing) return
      var tag = document.createElement('style')
      tag.dataset.plugin = plugin
      tag.dataset.pluginCss = id
      tag.textContent = text
      document.head.appendChild(tag)
    }

    /** Ascoder favicon：使用与侧栏品牌同源的矢量小鸟（SVG data URI）。 */
    var FAVICON = ASC_BIRD_SVG_URI

    /** 锁住页面标题：宿主布局会周期性写回产品名，这里观察并纠正。 */
    function lockDocumentTitle() {
      if (typeof document === 'undefined' || typeof window === 'undefined') return
      if (window.__ascoderTitleLocked === true) return
      window.__ascoderTitleLocked = true
      if (document.title !== 'Ascoder') document.title = 'Ascoder'
      if (typeof MutationObserver !== 'function') return
      var titleNode = document.querySelector('title')
      if (!titleNode) return
      var observer = new MutationObserver(function () {
        if (document.title !== 'Ascoder') document.title = 'Ascoder'
      })
      observer.observe(titleNode, { childList: true, characterData: true, subtree: true })
    }

    /** 设置页面标题、favicon。 */
    function applyDocumentChrome() {
      if (typeof document === 'undefined') return
      lockDocumentTitle()
      var links = document.querySelectorAll('link[rel~="icon"]')
      if (links.length === 0) {
        var created = document.createElement('link')
        created.rel = 'icon'
        created.type = 'image/svg+xml'
        created.setAttribute('data-ascoder-icon', 'true')
        document.head.appendChild(created)
        created.href = FAVICON
        return
      }
      for (var index = 0; index < links.length; index += 1) {
        var link = links[index]
        if (link.getAttribute && link.getAttribute('media')) link.removeAttribute('media')
        link.type = 'image/svg+xml'
        link.setAttribute('data-ascoder-icon', 'true')
        if (link.href !== FAVICON) link.href = FAVICON
      }
    }

    /** 侧栏品牌标记。 */


    /** 渐变定义：每个实例用独立 id，避免多处品牌标记互相覆盖。 */
    var brandSeq = 0



    /**
     * Ascoder 小鸟标记：SVG 路径 + 渐变动画。
     * @param props - size（像素）、live（是否播放动效）
     */
    function AscoderBird(props) {
      var size = props && typeof props.size === 'number' ? props.size : 24
      var live = !(props && props.live === false)
      var seq = (brandSeq += 1)
      var gradId = 'asc-bird-grad-' + seq
      return h('svg', {
        width: size, height: size, viewBox: ASC_BIRD_VIEWBOX,
        className: 'asc-bird' + (live ? ' asc-bird--live' : ''),
        role: 'img', 'aria-label': 'Ascoder', focusable: 'false',
      }, [
        h('defs', { key: 'd' }, [
          h('linearGradient', {
            key: 'g', id: gradId, x1: '0', y1: '1', x2: '1', y2: '0',
            gradientUnits: 'objectBoundingBox',
          }, [
            h('stop', { key: 'a', offset: '0%', stopColor: '#F87171' }),
            h('stop', { key: 'b', offset: '45%', stopColor: '#38BDF8' }),
            h('stop', { key: 'c', offset: '100%', stopColor: '#8B5CF6' }),
          ]),
        ]),
        h('path', { key: 'p', d: ASC_BIRD_PATH, fill: 'url(#' + gradId + ')', fillRule: 'evenodd' }),
      ])
    }

    /** 线性小图标路径（24 视窗，currentColor 描边）。 */
    var ICON_PATHS = {
      plus: ['M12 5v14', 'M5 12h14'],
      arrow: ['M5 12h13', 'M13 6l6 6-6 6'],
      refresh: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 5v6h-6'],
      bell: ['M18 15V10a6 6 0 1 0-12 0v5l-1.6 2.4a.6.6 0 0 0 .5.9h14.2a.6.6 0 0 0 .5-.9z', 'M10 21a2.2 2.2 0 0 0 4 0'],
      branch: ['M6 4v10', 'M6 14a2 2 0 1 0 .01 0', 'M6 6h5a3 3 0 0 1 3 3v2'],
      link: ['M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1', 'M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1'],
      trash: ['M4 7h16', 'M9 7V5h6v2', 'M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12'],
      folder: ['M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
      clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
      check: ['M5 12.5l4.5 4.5L19 7.5'],
      tool: ['M14.7 6.3a4 4 0 0 1 5 5l-9.4 9.4a2 2 0 0 1-2.8 0l-2.2-2.2a2 2 0 0 1 0-2.8z'],
      back: ['M19 12H6', 'M11 6l-6 6 6 6'],
      close: ['M6 6l12 12', 'M18 6L6 18'],
      search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
      more: ['M12 6.5h.01', 'M12 12h.01', 'M12 17.5h.01'],
      download: ['M12 4v11', 'M7.5 10.5L12 15l4.5-4.5', 'M5 20h14'],
      graph: ['M6 7.8a2 2 0 1 0 .01 0', 'M6 18.2a2 2 0 1 0 .01 0', 'M18 13a2 2 0 1 0 .01 0', 'M6 9.8v6.4', 'M8 7.8h4.6a3.4 3.4 0 0 1 3.2 2.4'],
      gear: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4'],
    }

    /**
     * 渲染一个线性小图标。
     * @param {string} name - 图标名（见 ICON_PATHS）
     * @param {number} [size] - 边长，默认 15
     */
    function ascIcon(name, size) {
      var paths = ICON_PATHS[name] || []
      return h('svg', {
        className: 'asc-icon asc-icon--' + name,
        width: size || 15,
        height: size || 15,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: name === 'check' ? 2.4 : name === 'more' ? 2.8 : 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      }, paths.map(function (d) { return h('path', { key: d, d: d }) }))
    }

    /**
     * Ascoder 字标：小鸟 + 渐变文字（代码绘制，可动效）。
     * @param props - size：文字字号，birdSize：图标尺寸
     */
    function AscoderWordmark(props) {
      var size = props && typeof props.size === 'number' ? props.size : 22
      var birdSize = props && typeof props.birdSize === 'number' ? props.birdSize : Math.round(size * 1.25)
      return h('span', { className: 'asc-wm' }, [
        h(AscoderBird, { key: 'b', size: birdSize }),
        h('span', { key: 't', className: 'asc-wm-text', style: { fontSize: size + 'px' } }, 'Ascoder'),
      ])
    }

    /** 欢迎区的大鸟：比侧栏更明显的浮动与倾斜。 */
    function AscoderHeroMark(props) {
      var size = props && typeof props.size === 'number' ? props.size : 40
      var seq = (brandSeq += 1)
      var gradId = 'asc-hero-grad-' + seq
      return h('svg', {
        width: size, height: size, viewBox: ASC_BIRD_VIEWBOX,
        className: 'asc-bird asc-bird--live asc-bird--hero',
        role: 'img', 'aria-label': 'Ascoder', focusable: 'false',
      }, [
        h('defs', { key: 'd' }, [
          h('linearGradient', { key: 'g', id: gradId, x1: '0', y1: '1', x2: '1', y2: '0' }, [
            h('stop', { key: 'a', offset: '0%', stopColor: '#F87171' }),
            h('stop', { key: 'b', offset: '45%', stopColor: '#38BDF8' }),
            h('stop', { key: 'c', offset: '100%', stopColor: '#8B5CF6' }),
          ]),
        ]),
        h('path', { key: 'p', d: ASC_BIRD_PATH, fill: 'url(#' + gradId + ')', fillRule: 'evenodd' }),
      ])
    }

    /** 品牌标记位只放小鸟（字标在名称位渲染，避免出现两只鸟）。 */
    function AscoderMark(props) {
      var size = props && typeof props.size === 'number' ? props.size : 24
      return h(AscoderBird, { size: size, live: true })
    }

    /** 用宿主设置快捷键（⌥⌘,）打开设置；宿主未注册快捷键时静默失败。 */
    function openHostSettings() {
      if (typeof window === 'undefined' || typeof KeyboardEvent !== 'function') return
      var options = {
        key: ',',
        code: 'Comma',
        keyCode: 188,
        which: 188,
        metaKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      }
      window.dispatchEvent(new KeyboardEvent('keydown', options))
      if (typeof document !== 'undefined') document.dispatchEvent(new KeyboardEvent('keydown', options))
    }

    /** 当前分支名（从工作区标题「项目 · 分支」解析）。 */
    function currentBranchName() {
      var title = currentSpaceTitle()
      if (!title) return null
      var parts = String(title).split(' · ')
      if (parts.length < 2) return null
      return parts[parts.length - 1].trim() || null
    }

    /** 品牌行的分支徽章：始终显示当前会话所在分支。 */
    function AscoderBranchBadge() {
      var branchHook = React.useState(currentBranchName)
      var branch = branchHook[0]
      var setBranch = branchHook[1]
      React.useEffect(function () {
        var timer = setInterval(function () { setBranch(currentBranchName()) }, 1500)
        return function () { clearInterval(timer) }
      }, [])
      if (!branch) return null
      return h('span', {
        className: 'asc-branchBadge',
        title: '当前分支：' + branch,
        'aria-label': '当前分支 ' + branch,
      }, [
        h('svg', {
          key: 'i',
          className: 'asc-branchBadgeIcon',
          viewBox: '0 0 16 16',
          width: 12,
          height: 12,
          'aria-hidden': 'true',
          focusable: 'false',
        }, [
          h('path', {
            key: 'p',
            d: 'M5 2.5v7.2M5 2.5a1.6 1.6 0 1 0 0 .1M5 12.2a1.6 1.6 0 1 0 0 .1M11 5.5a1.6 1.6 0 1 0 0 .1M11 6.6c0 2-1.4 3.1-3.4 3.4-1 .15-1.6.4-1.6.9',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.4,
            strokeLinecap: 'round',
          }),
        ]),
        h('span', { key: 't', className: 'asc-branchBadgeText' }, branch),
      ])
    }

    /** 侧栏品牌名称：点击进入 Ascoder 首页；右侧挂当前分支徽章。 */
    function AscoderName() {
      return h(React.Fragment, null, [
        h('button', {
          key: 'brand',
          type: 'button',
          className: 'asc-brand-name',
          onClick: function () { emitOverlayEvent('ascoder:home') },
          title: 'Ascoder 首页',
          'aria-label': '打开 Ascoder 首页',
        }, [
          h('span', { key: 't', className: 'asc-wm-text asc-wm-text--nav', 'aria-hidden': 'true' }, 'Ascoder'),
        ]),
        h(AscoderBranchBadge, { key: 'branch' }),
      ])
    }

    /** GET 一个 Ascoder API，返回 data。 */
    async function apiGet(path) {
      var response = await fetch(path, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error('请求失败（HTTP ' + response.status + '）')
      var payload = await response.json()
      if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || '请求失败')
      return payload.data
    }

    /** POST 一个 Ascoder 写操作，返回 data。 */
    async function apiAction(body) {
      var response = await fetch('/api/ascoder/action', {
        method: 'POST',
        credentials: 'include',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('操作失败（HTTP ' + response.status + '）')
      var payload = await response.json()
      if (!payload || payload.ok !== true) throw new Error((payload && payload.error) || '操作失败')
      return payload.data
    }

        /**
     * 打开某个 workspace 的会话。
     *
     * 先 `openWorkspace` 把侧栏选中分组切到位（否则侧栏仍显示上一个分支的会话，
     * 看起来就像"分支串了"），再 `startSession` 落到空白会话；宿主能力缺失时抛错。
     * @param workspaceId - 目标 workspace id
     * @returns 切换完成后的 Promise
     */
    function openWorkspaceSession(workspaceId) {
      var uiWorkspace = optionalService('uiWorkspace')
      if (!uiWorkspace) throw new Error('当前界面不支持从插件打开会话')
      if (typeof uiWorkspace.openWorkspace === 'function') {
        return uiWorkspace.openWorkspace(workspaceId).then(function () {
          if (typeof uiWorkspace.startSession === 'function') uiWorkspace.startSession(workspaceId)
        })
      }
      if (typeof uiWorkspace.startSession === 'function') {
        uiWorkspace.startSession(workspaceId)
        return Promise.resolve()
      }
      throw new Error('当前界面不支持从插件打开会话')
    }

    /** 状态徽标文案。 */
    var STATUS_TEXT = { ready: '就绪', unprepared: '待准备', stale: '需更新', failed: '失败' }

    /** 状态徽标。 */
    function StatusPill(props) {
      return h('span', { className: 'asc-pill asc-pill--' + (props.status || 'unprepared') }, STATUS_TEXT[props.status] || props.status || '')
    }

    /** 设置页是否已解锁（仅本次页面会话有效）。 */
    var settingsUnlocked = false

    /** 最近一次进入分支空间所属的项目 id（会话页「返回项目」用）。 */
    var lastProjectId = null

    /** 会话头部返回按钮：显示当前分支空间，点击回到所属 Ascoder 项目页。 */
    function AscoderProjectCrumb() {
      var labelHook = React.useState(currentSpaceTitle)
      var spaceTitle = labelHook[0]
      var setSpaceTitle = labelHook[1]

      React.useEffect(function () {
        var timer = setInterval(function () {
          var next = currentSpaceTitle()
          setSpaceTitle(function (previous) { return previous === next ? previous : next })
        }, 1500)
        return function () { clearInterval(timer) }
      }, [])

      // 面包屑只显示项目名：分支名已有品牌徽章与底部控制栏，避免三处重复
      var label = spaceTitle ? String(spaceTitle).split(' · ')[0].trim() : 'Ascoder'
      return h('button', {
        type: 'button',
        className: 'asc-crumb',
        onClick: function () { emitOverlayEvent('ascoder:home', { spaceTitle: spaceTitle }) },
        title: '返回项目页' + (spaceTitle ? '：' + spaceTitle : ''),
        'aria-label': '返回 Ascoder 项目页' + (spaceTitle ? '（当前 ' + spaceTitle + '）' : ''),
      }, [
        h('svg', {
          key: 'i', width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none',
          stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
          'aria-hidden': 'true',
        }, [h('path', { key: 'p', d: 'M15 18l-6-6 6-6' })]),
        h('span', { key: 't' }, label),
      ])
    }

    /** 广播分支切换状态（分支栏 → 全屏切换遮罩）。 */
    function emitSwitchEvent(detail) {
      if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
      window.dispatchEvent(new CustomEvent('ascoder:switch', { detail: detail }))
    }

    /**
     * 分支切换遮罩：切换期间盖住页面，拦截指针与键盘，并展示动效与当前步骤。
     *
     * 切换会更换 workspace（必要时还要克隆/准备分支空间），期间任何点击都可能
     * 落在中间态，所以这里做真正的阻断，而不是只改显示。
     */
    /**
     * 菜单键盘导航工厂：上下键在可见菜单项间移动，Enter/Space 触发，Esc 关闭。
     * @param onClose - 关闭回调
     * @returns 绑定到 onKeyDown 的处理函数
     */
    function menuKeyboard(onClose) {
      return function (event) {
        if (!event) return
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
          return
        }
        var items = Array.prototype.slice
          .call(document.querySelectorAll('[role="menuitem"]'))
          .filter(function (item) {
            return !item.disabled && item.offsetParent !== null
          })
        if (items.length === 0) return
        var index = items.indexOf(document.activeElement)
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          items[(index + 1) % items.length].focus()
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          items[(index - 1 + items.length) % items.length].focus()
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          var active = document.activeElement
          if (items.indexOf(active) >= 0) {
            event.preventDefault()
            active.click()
          }
        }
      }
    }

    function AscoderSwitchOverlay() {
      var stateHook = React.useState({ active: false, branch: '', message: '' })
      var state = stateHook[0]
      var setState = stateHook[1]

      React.useEffect(function () {
        function onSwitch(event) {
          var detail = (event && event.detail) || {}
          if (detail.active) {
            if (switchOverlayHideTimer) {
              clearTimeout(switchOverlayHideTimer)
              switchOverlayHideTimer = 0
            }
            if (!switchOverlayStartedAt) switchOverlayStartedAt = Date.now()
            setState({ active: true, branch: detail.branch || '', message: detail.message || '' })
            return
          }
          var elapsed = switchOverlayStartedAt ? Date.now() - switchOverlayStartedAt : SWITCH_OVERLAY_MIN_MS
          var remaining = Math.max(0, SWITCH_OVERLAY_MIN_MS - elapsed)
          var finish = function () {
            switchOverlayHideTimer = 0
            switchOverlayStartedAt = 0
            setState({ active: false, branch: '', message: '' })
          }
          if (remaining > 0) switchOverlayHideTimer = setTimeout(finish, remaining)
          else finish()
        }
        window.addEventListener('ascoder:switch', onSwitch)
        return function () {
          window.removeEventListener('ascoder:switch', onSwitch)
          if (switchOverlayHideTimer) {
            clearTimeout(switchOverlayHideTimer)
            switchOverlayHideTimer = 0
          }
        }
      }, [])

      // 遮罩显示期间锁住页面滚动
      React.useEffect(function () {
        if (!state.active || typeof document === 'undefined') return undefined
        var previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return function () { document.body.style.overflow = previous }
      }, [state.active])

      // 切换期间阻断键盘操作（保留 Esc，避免用户被彻底锁死）
      React.useEffect(function () {
        if (!state.active) return undefined
        var block = function (event) {
          if (event.key === 'Escape') return
          event.preventDefault()
          event.stopPropagation()
        }
        window.addEventListener('keydown', block, true)
        window.addEventListener('keyup', block, true)
        return function () {
          window.removeEventListener('keydown', block, true)
          window.removeEventListener('keyup', block, true)
        }
      }, [state.active])

      if (!state.active) return null
      return h('div', {
        className: 'asc-switchLayer',
        role: 'status',
        'aria-live': 'polite',
        'aria-busy': 'true',
        'aria-label': '正在切换分支',
      }, [
        h('div', { className: 'asc-switchCard', key: 'card' }, [
          h('span', { className: 'asc-switchMark', key: 'm', 'aria-hidden': 'true' }, [
            h('span', { className: 'asc-switchRing', key: 'r' }),
            h('span', { className: 'asc-switchBirdFloat', key: 'f' }, [h(AscoderBird, { size: 46, live: true })]),
          ]),
          h('span', { className: 'asc-switchTitle', key: 't' }, '正在切换到 ' + (state.branch || '目标分支')),
          h('span', { className: 'asc-switchHint', key: 'h' }, state.message || '正在切换分支空间…'),
        ]),
      ])
    }

    /** 广播一个 Ascoder 浮层事件（品牌按钮 / 快捷键 → 首页或密码门）。 */
    function emitOverlayEvent(kind, detail) {
      if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
      window.dispatchEvent(new CustomEvent(kind, detail ? { detail: detail } : undefined))
    }

    /**
     * 从侧栏当前选中的会话反推它所属的分组标题（`项目 · 分支`）。
     * @returns {string|null} 分组标题；找不到返回 null
     */
    /** 最近一次确认过的分支标题（侧栏分组收起时 DOM 里没有会话行，用它兜底）。 */
    var rememberedSpaceTitle = null
    var SPACE_TITLE_KEY = 'ascoder.spaceTitle'

    /** 记住当前分支标题，供新会话等 DOM 无会话行的场景使用。 */
    function rememberSpaceTitle(title) {
      var value = typeof title === 'string' ? title.trim() : ''
      if (value === '') return
      rememberedSpaceTitle = value
      // 进入/切换分支时同步"当前分支"，侧栏过滤据此收敛
      currentBranchTitle = value
      try { window.localStorage.setItem(SPACE_TITLE_KEY, value) } catch (error) { /* 隐私模式忽略 */ }
    }

    /** 记忆值是否仍然对应一个真实的分支空间（避免已删除分支的脏值继续生效）。 */
    function rememberedTitleValid(title) {
      if (!title) return false
      if (!allowedGroupTitles) return true
      return allowedGroupTitles[title] === true
    }

    /** 读取记住的分支标题（校验通过才返回）。 */
    function rememberedTitle() {
      if (rememberedSpaceTitle) return rememberedTitleValid(rememberedSpaceTitle) ? rememberedSpaceTitle : null
      try {
        var stored = window.localStorage.getItem(SPACE_TITLE_KEY)
        if (stored) rememberedSpaceTitle = stored
      } catch (error) { /* 忽略 */ }
      return rememberedTitleValid(rememberedSpaceTitle) ? rememberedSpaceTitle : null
    }

    /**
     * 当前会话所属的分支标题（形如 `项目 · 分支`）。
     * 侧栏分组展开时直接读 DOM；收起或新建会话时回退到最近记住的值。
     */
    function currentSpaceTitle() {
      return domSpaceTitle() || rememberedTitle()
    }

    /** 从侧栏选中的会话行回溯到所属分组标题。 */
    function domSpaceTitle() {
      if (typeof document === 'undefined') return null
      var selected = document.querySelector('[role="treeitem"][aria-selected="true"]')
      if (!selected) return null
      // 折叠/展开分组时，宿主会把选中落到 workspace 行上——这不是切换分支，
      // 继续沿用最近一次会话所在的分支，否则会出现"收起 develop 变成 v2"。
      var selectedKey = selected.getAttribute('data-row-key') || ''
      if (selectedKey.indexOf('workspace:') === 0) return null
      var node = selected
      while (node && node !== document.body) {
        var row = node.querySelector ? node.querySelector('[class*="projectRow"]') : null
        var inside = node.querySelector ? node.querySelector('[role="treeitem"][aria-selected="true"]') : null
        if (row && inside) {
          var titleEl = row.querySelector('[class*="projectText"]')
          var title = titleEl ? (titleEl.textContent || '').trim() : ''
          if (title) {
            currentBranchTitle = title
            rememberSpaceTitle(title)
            return title
          }
          return null
        }
        node = node.parentElement
      }
      return null
    }

    /** 打开「设置」：已解锁直接开，否则弹密码门。 */
    function requestSettings() {
      if (settingsUnlocked) {
        openHostSettings()
        return
      }
      emitOverlayEvent('ascoder:gate')
    }

    /** 拦截宿主的设置快捷键（⌥⌘,），未解锁时改问密码。 */
    function installSettingsShortcutGate() {
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return
      if (window.__ascoderShortcutGate === true) return
      window.__ascoderShortcutGate = true
      window.addEventListener('keydown', function (event) {
        var isComma = event.key === ',' || event.code === 'Comma'
        var withModifiers = (event.metaKey || event.ctrlKey) && event.altKey
        if (!isComma || !withModifiers) return
        if (settingsUnlocked) return
        event.preventDefault()
        event.stopPropagation()
        emitOverlayEvent('ascoder:gate')
      }, true)
    }

    /** 相对时间：刚刚 / N 分钟前 / N 小时前 / 日期。 */
    /**
     * 把「毫秒差」格式化成人类可读的耗时：`52 秒` / `3 分 20 秒` / `1 小时 5 分`。
     *
     * 任务页原来只有"刚刚/2 小时前"这种时间点，用户看不出一次同步到底花了多久。
     * @param ms - 毫秒差
     * @returns 紧凑的耗时描述
     */
    function durationText(ms) {
      if (!isFinite(ms) || ms < 0) return ''
      var seconds = Math.round(ms / 1000)
      if (seconds < 60) return seconds + ' 秒'
      var minutes = Math.floor(seconds / 60)
      var restSeconds = seconds % 60
      if (minutes < 60) return restSeconds === 0 ? minutes + ' 分' : minutes + ' 分 ' + restSeconds + ' 秒'
      var hours = Math.floor(minutes / 60)
      var restMinutes = minutes % 60
      return restMinutes === 0 ? hours + ' 小时' : hours + ' 小时 ' + restMinutes + ' 分'
    }

    function shortTime(iso) {
      if (!iso) return ''
      var then = new Date(iso).getTime()
      if (!isFinite(then)) return ''
      var now = new Date()
      var diff = now.getTime() - then
      if (diff < 60 * 1000) return '刚刚'
      if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前'
      if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前'
      // 按日历日差判断，而不是"差 24~48 小时就叫昨天"：
      // 例如 30 小时前可能是前天的某个时刻，标成"昨天"会误导。
      var date = new Date(then)
      var dayStart = function (value) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
      }
      var days = Math.round((dayStart(now) - dayStart(date)) / 86400000)
      if (days === 1) return '昨天'
      if (days === 2) return '前天'
      var label = (date.getMonth() + 1) + '/' + date.getDate()
      // 跨年时补年份，避免"11/11"看不出是哪一年
      if (date.getFullYear() !== now.getFullYear()) label = date.getFullYear() + '/' + label
      return label
    }

    /** 绝对时间（悬停提示用）：2026-11-12 09:30，避免"11/11"看不出年份。 */
    function absoluteTime(iso) {
      if (!iso) return ''
      var date = new Date(iso)
      if (!isFinite(date.getTime())) return ''
      var pad = function (value) { return value < 10 ? '0' + value : String(value) }
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
        ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    }

    /**
     * 轮询异步任务直到结束。
     * @param {string} taskId - 任务 id
     * @param {Function} [onUpdate] - 每次轮询回调
     * @returns {Promise<object>} 结束时的任务
     */
    function pollTask(taskId, onUpdate) {
      return new Promise(function (resolve, reject) {
        var deadline = Date.now() + 10 * 60 * 1000
        var timer = setInterval(function () {
          if (Date.now() > deadline) {
            clearInterval(timer)
            reject(new Error('任务超时'))
            return
          }
          apiGet('/api/ascoder/tasks?id=' + encodeURIComponent(taskId)).then(function (payload) {
            var task = payload && payload.task
            if (!task) return
            if (onUpdate) onUpdate(task)
            if (task.status === 'succeeded') {
              clearInterval(timer)
              resolve(task)
            } else if (task.status === 'failed' || task.status === 'cancelled') {
              clearInterval(timer)
              reject(new Error(task.error || (task.status === 'cancelled' ? '任务已取消' : '任务失败')))
            }
          }).catch(function () { /* 单次失败下轮重试 */ })
        }, 700)
      })
    }

    /** 状态文案与语气。 */
    var SPACE_STATUS = {
      ready: { text: '就绪', tone: 'ready' },
      unprepared: { text: '待准备', tone: 'unprepared' },
      failed: { text: '失败', tone: 'failed' },
    }

    /** 状态胶囊。 */
    function SpacePill(props) {
      var meta = SPACE_STATUS[props.status] || SPACE_STATUS.unprepared
      return h('span', { className: 'asc-pill asc-pill--' + meta.tone }, meta.text)
    }

    /** 统一页面头部：左侧品牌与标题，右侧动作。 */
    /**
     * 页面头部：左侧固定 Ascoder 彩色字标，右侧动作；字标后用一个小标签说明当前页面。
     * @param props - label：页面名称（项目名 / 功能名），actions：右侧动作
     */
    /**
     * 全局任务进度：任何页面右下角都能看到正在跑的任务。
     *
     * 之前只有「任务与事件」页能看到进度，用户在别处点了更新/索引就只能盲等。
     * 这里独立轮询任务接口（有任务 2 秒一次、空闲 6 秒一次），点标题展开、可取消、可跳任务页。
     */
    var TASK_KIND_TEXT = {
      'codegraph.index': '代码索引',
      'space.prepare': '准备空间',
      'space.sync': '更新代码',
      'space.clone': '克隆仓库',
      'repository.sync': '同步仓库',
    }

    function AscoderTaskDock() {
      var stateHook = React.useState({ running: [], justDone: '' })
      var state = stateHook[0]
      var setState = stateHook[1]
      var expandedHook = React.useState(false)
      var expanded = expandedHook[0]
      var setExpanded = expandedHook[1]
      var doneTimerRef = React.useRef(null)
      var sawRunningRef = React.useRef(false)

      React.useEffect(function () {
        var stopped = false
        var timer = null

        function schedule(delay) {
          if (stopped) return
          if (timer) clearTimeout(timer)
          timer = setTimeout(tick, delay)
        }

        function tick() {
          apiGet('/api/ascoder/tasks?limit=20')
            .then(function (payload) {
              if (stopped) return
              var running = (payload && payload.running) || []
              if (running.length > 0) {
                sawRunningRef.current = true
                setState({ running: running, justDone: '' })
                schedule(2000)
                return
              }
              // 从「有任务」变成「没有」：短暂显示完成提示，避免用户以为任务凭空消失
              if (sawRunningRef.current) {
                sawRunningRef.current = false
                setState({ running: [], justDone: '任务已完成' })
                if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
                doneTimerRef.current = setTimeout(function () {
                  if (!stopped) setState({ running: [], justDone: '' })
                }, 3200)
                schedule(6000)
                return
              }
              setState({ running: [], justDone: '' })
              schedule(6000)
            })
            .catch(function () {
              if (!stopped) schedule(8000)
            })
        }

        tick()
        return function () {
          stopped = true
          if (timer) clearTimeout(timer)
          if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
        }
      }, [])

      var running = state.running
      if (running.length === 0 && !state.justDone) return null

      if (state.justDone) {
        return h('div', { className: 'asc-taskDock', 'aria-live': 'polite' }, [
          h('div', { className: 'asc-taskDockDone', key: 'd' }, [
            ascIcon('check'),
            h('span', { key: 't' }, state.justDone),
          ]),
        ])
      }

      var primary = running[0]
      var done = 0
      var total = 0
      running.forEach(function (task) {
        var progress = task.progress || {}
        done += Number(progress.done) || 0
        total += Number(progress.total) || 0
      })
      var percent = total > 0 ? Math.round((done / total) * 100) : 0

      function openActivity() {
        emitOverlayEvent('ascoder:activity')
      }

      var headLabel = running.length > 1
        ? running.length + ' 个任务进行中 · ' + (TASK_KIND_TEXT[primary.kind] || primary.kind)
        : (TASK_KIND_TEXT[primary.kind] || primary.kind) + '：' + primary.title

      var children = [
        h('button', {
          key: 'head',
          type: 'button',
          className: 'asc-taskDockHead',
          onClick: function () { setExpanded(function (value) { return !value }) },
          title: expanded ? '收起任务列表' : '展开任务列表',
          'aria-expanded': expanded ? 'true' : 'false',
        }, [
          h('span', { className: 'asc-taskBird', key: 'b', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 15, live: true })]),
          h('span', { className: 'asc-taskDockTitle', key: 't' }, headLabel),
          h('span', { className: 'asc-taskDockMeta', key: 'p' }, percent + '%'),
        ]),
        h('div', { className: 'asc-taskDockBar', key: 'bar' }, [
          h('div', { className: 'asc-taskDockFill', key: 'f', style: { width: percent + '%' } }),
        ]),
      ]

      if (expanded) {
        children.push(h('div', { className: 'asc-taskDockList', key: 'list' }, running.map(function (task) {
          var progress = task.progress || {}
          var memberPercent = Number(progress.total) > 0
            ? Math.round((Number(progress.done) / Number(progress.total)) * 100)
            : 0
          return h('div', { className: 'asc-taskDockRow', key: task.id }, [
            h('div', { className: 'asc-taskDockRowMain', key: 'm' }, [
              h('span', { className: 'asc-taskDockRowName', key: 'n' }, task.title),
              h('span', { className: 'asc-taskDockRowMsg', key: 'g' }, (task.message || '准备中…') + ' · ' + memberPercent + '%'),
            ]),
            h('button', {
              key: 'c',
              type: 'button',
              className: 'asc-iconBtn asc-iconBtn--danger',
              title: '取消该任务',
              'aria-label': '取消任务 ' + task.title,
              onClick: function (id) {
                return function () {
                  apiAction({ op: 'task.cancel', taskId: id }).catch(function () {})
                }
              }(task.id),
            }, [ascIcon('close')]),
          ])
        })))
        children.push(h('div', { className: 'asc-taskDockMore', key: 'more' }, [
          h('button', {
            type: 'button',
            className: 'asc-taskDockLink',
            onClick: openActivity,
            'aria-label': '打开任务与事件页',
          }, '查看全部任务与事件 →'),
        ]))
      }

      return h('div', { className: 'asc-taskDock', role: 'status', 'aria-live': 'polite' }, children)
    }

    function PageHeader(props) {
      // 版本号不在主界面出现（产品界面不是发布页）；需要时去「设置 · 关于」看
      return h('div', { className: 'asc-homeHead' }, [
        h('div', { className: 'asc-homeBrand', key: 'b' }, [
          h(AscoderWordmark, { key: 'w', size: 22, birdSize: 28 }),
          props.label ? h('span', { className: 'asc-brandLabel', key: 'l' }, props.label) : null,
        ]),
        h('div', { className: 'asc-actions', key: 'a' }, props.actions || []),
      ])
    }

    /** 分支名前缀分组（fix/ feat/ ... 归到一组，没有斜杠的归到「其他」）。 */
    function groupBranches(list) {
      var groups = []
      var index = {}
      for (var i = 0; i < list.length; i += 1) {
        var name = list[i]
        var slash = name.indexOf('/')
        var key = slash > 0 ? name.slice(0, slash) : '其他'
        if (!index[key]) {
          index[key] = { key: key, branches: [] }
          groups.push(index[key])
        }
        index[key].branches.push(name)
      }
      groups.sort(function (a, b) {
        if (a.key === '其他') return 1
        if (b.key === '其他') return -1
        return a.key.localeCompare(b.key)
      })
      return groups
    }

    /** Ascoder 主界面：首页（项目）→ 项目（分支空间）→ 新建空间 / 项目管理。 */
    function AscoderHomeOverlay() {
      var openHook = React.useState(true)
      var open = openHook[0]
      var setOpen = openHook[1]

      var screenHook = React.useState('projects')
      var screen = screenHook[0]
      var setScreen = screenHook[1]

      var stateHook = React.useState({ status: 'loading', data: null, error: '' })
      var view = stateHook[0]
      var setView = stateHook[1]

      var projectIdHook = React.useState(null)
      var projectId = projectIdHook[0]
      var setProjectId = projectIdHook[1]

      var branchHook = React.useState({ status: 'idle', data: null, error: '' })
      var branchState = branchHook[0]
      var setBranchState = branchHook[1]

      // 新建空间时的成员分支预览（picked 变化后自动加载候选）
      var newSpaceMapHook = React.useState({ status: 'idle', branch: '', members: [], candidates: {}, picks: {}, error: '' })
      var newSpaceMap = newSpaceMapHook[0]
      var setNewSpaceMap = newSpaceMapHook[1]

      // 分支映射编辑器：空间里每个成员仓库的检出分支
      var spaceBranchHook = React.useState({ status: 'idle', spaceId: '', space: null, members: [], candidates: {}, picks: {}, error: '', notice: '' })
      var spaceBranch = spaceBranchHook[0]
      var setSpaceBranch = spaceBranchHook[1]

      var progressHook = React.useState({})
      var progress = progressHook[0]
      var setProgress = progressHook[1]

      // 每个分支空间的 CodeGraph 索引状态：{ [spaceId]: { indexed, total, running } }
      var indexHook = React.useState({})
      var indexInfo = indexHook[0]
      var setIndexInfo = indexHook[1]

      // 分支空间页：搜索/筛选/排序与行内“更多操作”菜单
      var spaceQueryHook = React.useState('')
      var spaceQuery = spaceQueryHook[0]
      var setSpaceQuery = spaceQueryHook[1]

      var spaceStatusHook = React.useState('all')
      var spaceStatus = spaceStatusHook[0]
      var setSpaceStatus = spaceStatusHook[1]

      var spaceSortHook = React.useState('recent')
      var spaceSort = spaceSortHook[0]
      var setSpaceSort = spaceSortHook[1]

      // 行内菜单：记录 { id, x, y }，用 fixed 定位避免被行容器的 overflow 裁掉
      var spaceMenuHook = React.useState(null)
      var spaceMenu = spaceMenuHook[0]
      var setSpaceMenu = spaceMenuHook[1]

      // 行内菜单：Esc 或点击外部关闭
      React.useEffect(function () {
        if (!spaceMenu) return undefined
        var onKey = function (event) { if (event.key === 'Escape') setSpaceMenu(null) }
        var onDown = function (event) {
          var target = event.target
          if (target && target.closest && target.closest('.asc-spaceActions')) return
          if (target && target.closest && target.closest('.asc-spaceMenu')) return
          setSpaceMenu(null)
        }
        var onViewport = function () { setSpaceMenu(null) }
        document.addEventListener('keydown', onKey)
        document.addEventListener('pointerdown', onDown, true)
        window.addEventListener('resize', onViewport)
        window.addEventListener('scroll', onViewport, true)
        return function () {
          document.removeEventListener('keydown', onKey)
          document.removeEventListener('pointerdown', onDown, true)
          window.removeEventListener('resize', onViewport)
          window.removeEventListener('scroll', onViewport, true)
        }
      }, [spaceMenu])

      var activityHook = React.useState({ status: 'loading', running: [], tasks: [], events: [], cursor: 0, error: '' })
      var activity = activityHook[0]
      var setActivity = activityHook[1]

      var eventPageHook = React.useState(0)
      var eventPage = eventPageHook[0]
      var setEventPage = eventPageHook[1]

      var eventFilterHook = React.useState('all')
      var eventFilter = eventFilterHook[0]
      var setEventFilter = eventFilterHook[1]

      var taskFilterHook = React.useState('all')
      var taskFilter = taskFilterHook[0]
      var setTaskFilter = taskFilterHook[1]

      var taskPageHook = React.useState(0)
      var taskPage = taskPageHook[0]
      var setTaskPage = taskPageHook[1]

      var pickedHook = React.useState('')
      var picked = pickedHook[0]
      var setPicked = pickedHook[1]

      var queryHook = React.useState('')
      var query = queryHook[0]
      var setQuery = queryHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var createOpenHook = React.useState(false)
      var createOpen = createOpenHook[0]
      var setCreateOpen = createOpenHook[1]

      var draftHook = React.useState({ name: '', description: '' })
      var draft = draftHook[0]
      var setDraft = draftHook[1]

      var memberOpenHook = React.useState(false)
      var memberOpen = memberOpenHook[0]
      var setMemberOpen = memberOpenHook[1]

      var memberDraftHook = React.useState({ repositoryId: '', alias: '' })
      var memberDraft = memberDraftHook[0]
      var setMemberDraft = memberDraftHook[1]

      var importHook = React.useState({
        open: false, provider: 'bitbucket', baseUrl: 'https://bitbucket.example.com',
        credentialId: '', projectKey: '', org: '', projects: [], repos: [], selected: {}, busy: '', error: '',
      })
      var importState = importHook[0]
      var setImport = importHook[1]

      var repoFormHook = React.useState({ open: false, mode: 'local', value: '', name: '', credentialId: '' })
      var repoForm = repoFormHook[0]
      var setRepoForm = repoFormHook[1]

      var editHook = React.useState({ name: '', description: '' })
      var edit = editHook[0]
      var setEdit = editHook[1]

      var pendingHook = React.useState(null)
      var pending = pendingHook[0]
      var setPending = pendingHook[1]

      var gateHook = React.useState({ open: false, password: '', error: '', busy: false })
      var gate = gateHook[0]
      var setGate = gateHook[1]

      var load = React.useCallback(async function () {
        setView(function (previous) { return { status: 'loading', data: previous.data, error: '' } })
        try {
          setView({ status: 'ready', data: await apiGet('/api/ascoder/state'), error: '' })
        } catch (failure) {
          setView({ status: 'error', data: null, error: failure.message })
        }
      }, [])

      React.useEffect(function () {
        load()
      }, [load])

      /** 读取任务与事件（活动页首次打开 / 手动刷新用）。 */
      var loadActivity = React.useCallback(function () {
        return Promise.all([
          apiGet('/api/ascoder/tasks?limit=200'),
          apiGet('/api/ascoder/events?limit=200'),
        ]).then(function (results) {
          var tasks = results[0] || {}
          var events = results[1] || {}
          setActivity({
            status: 'ready',
            running: tasks.running || [],
            tasks: tasks.tasks || [],
            events: events.events || [],
            cursor: events.cursor || 0,
            error: '',
          })
          return { runningCount: (tasks.running || []).length, cursor: events.cursor || 0 }
        }).catch(function (failure) {
          setActivity(function (previous) {
            return Object.assign({}, previous, { status: 'error', error: failure.message })
          })
          return { runningCount: 0, cursor: 0 }
        })
      }, [])

      /** 只刷新任务（运行中进度），比整页刷新轻。 */
      var refreshTasks = React.useCallback(function () {
        return apiGet('/api/ascoder/tasks').then(function (payload) {
          var tasks = payload || {}
          setActivity(function (previous) {
            return Object.assign({}, previous, {
              status: 'ready',
              running: tasks.running || [],
              tasks: tasks.tasks || [],
            })
          })
          return (tasks.running || []).length
        }).catch(function () { return 0 })
      }, [])

      /**
       * 事件驱动刷新：空闲时只拉事件增量（无变化时开销极小），
       * 有运行中任务时才高频刷新进度；出现新事件立刻整页刷新。
       */
      React.useEffect(function () {
        if (screen !== 'activity') return undefined
        var stopped = false
        var timer = 0
        var cursor = -1
        var runningCount = 0

        var schedule = function (delay) {
          if (stopped) return
          timer = setTimeout(tick, delay)
        }

        var tick = function () {
          if (stopped) return
          var query = '/api/ascoder/events?limit=40' + (cursor >= 0 ? '&since=' + cursor : '')
          apiGet(query).then(function (payload) {
            if (stopped) return
            var incoming = (payload && payload.events) || []
            var newCursor = (payload && payload.cursor) || 0
            var hasNew = cursor < 0 || incoming.length > 0
            cursor = newCursor
            if (hasNew) {
              return loadActivity().then(function (result) {
                runningCount = result.runningCount
                cursor = result.cursor
                schedule(runningCount > 0 ? 800 : 2500)
              })
            }
            if (runningCount > 0) {
              return refreshTasks().then(function (count) {
                runningCount = count
                schedule(count > 0 ? 800 : 2500)
              })
            }
            schedule(2500)
          }).catch(function () {
            schedule(3000)
          })
        }

        tick()
        return function () {
          stopped = true
          clearTimeout(timer)
        }
      }, [screen, loadActivity, refreshTasks])

      React.useEffect(function () {
        // 返回：优先按当前会话所在空间定位项目，其次回到上次进入的项目，最后项目列表
        function onHome(event) {
          var detail = event && event.detail
          setOpen(true)
          setPending({ title: detail && detail.spaceTitle ? detail.spaceTitle : null, projectId: lastProjectId })
          setScreen('projects')
          setNotice(null)
          load()
        }
        function onGate() { setOpen(true); setGate({ open: true, password: '', error: '', busy: false }) }
        function onActivity() {
          setOpen(true)
          setScreen('activity')
          setNotice(null)
          load()
        }
        window.addEventListener('ascoder:home', onHome)
        window.addEventListener('ascoder:gate', onGate)
        window.addEventListener('ascoder:activity', onActivity)
        return function () {
          window.removeEventListener('ascoder:home', onHome)
          window.removeEventListener('ascoder:gate', onGate)
          window.removeEventListener('ascoder:activity', onActivity)
        }
      }, [load])

      var projects = (view.data && view.data.projects) || []
      var repositories = (view.data && view.data.repositories) || []
      var credentials = (view.data && view.data.credentials) || []

      // 返回导航：按「项目 · 分支」标题找回项目，退化到上次进入的项目
      React.useEffect(function () {
        if (!pending || !view.data) return
        var found = null
        if (pending.title) {
          for (var i = 0; i < projects.length && !found; i += 1) {
            var spaces = projects[i].spaces || []
            for (var j = 0; j < spaces.length; j += 1) {
              if (projects[i].name + ' · ' + spaces[j].branch === pending.title) {
                found = projects[i]
                break
              }
            }
          }
        }
        if (!found && pending.projectId) {
          for (var k = 0; k < projects.length; k += 1) {
            if (projects[k].id === pending.projectId) found = projects[k]
          }
        }
        setPending(null)
        if (!found) return
        setProjectId(found.id)
        setEdit({ name: found.name, description: found.description || '' })
        setMemberOpen(false)
        setQuery('')
        setPicked('')
        setScreen('spaces')
      }, [view.data, pending])

      var project = null
      for (var index = 0; index < projects.length; index += 1) {
        if (projects[index].id === projectId) project = projects[index]
      }

      /** 读取当前项目的索引覆盖与正在跑的索引任务。 */
      var loadIndexInfo = React.useCallback(function () {
        if (!project) return
        apiGet('/api/ascoder/codegraph?projectId=' + encodeURIComponent(project.id))
          .then(function (payload) {
            var next = {}
            ;(payload && payload.spaces || []).forEach(function (space) {
              var first = (space.members || [])[0] || {}
              next[space.spaceId] = {
                indexed: space.indexedCount,
                total: space.memberCount,
                available: space.available,
                files: first.files,
                symbols: first.symbols,
                indexStatus: space.indexStatus,
              }
            })
            setIndexInfo(function (previous) {
              var merged = Object.assign({}, previous, next)
              // 保留正在跑的任务标记
              Object.keys(merged).forEach(function (key) {
                if (previous[key] && previous[key].running) merged[key] = Object.assign({}, merged[key], { running: previous[key].running })
              })
              return merged
            })
          })
          .catch(function () { /* 索引状态读不到时不影响空间列表 */ })
        apiGet('/api/ascoder/tasks')
          .then(function (payload) {
            var running = {}
            ;(payload && payload.running || []).forEach(function (task) {
              if (task.kind === 'codegraph.index' && task.spaceId) running[task.spaceId] = task.message || '索引中…'
            })
            setIndexInfo(function (previous) {
              var next = Object.assign({}, previous)
              Object.keys(next).forEach(function (key) { delete next[key].running })
              Object.keys(running).forEach(function (key) {
                next[key] = Object.assign({}, next[key] || {}, { running: running[key] })
              })
              return next
            })
          })
          .catch(function () { /* 任务接口不可用时只显示覆盖情况 */ })
      }, [project])

      React.useEffect(function () {
        if (screen !== 'spaces' || !project) return undefined
        loadIndexInfo()
        // 该接口要为每个成员跑一次 codegraph status（3 成员空间约 4 秒），2.5 秒轮询会背靠背打满
        var timer = setInterval(loadIndexInfo, 10000)
        return function () { clearInterval(timer) }
      }, [screen, project, loadIndexInfo])

      /**
       * 执行写操作：统一 busy/notice/刷新 处理。
       * @param {string} key - busy 标记
       * @param {Function} action - 异步动作
       * @param {Function} [after] - 成功后的导航
       */
      function run(key, action, after) {
        if (busy !== '') return
        setBusy(key)
        setNotice(null)
        ;(async function () {
          try {
            await action()
            await load()
            if (after) after()
          } catch (failure) {
            setNotice({ text: failure.message })
          } finally {
            setBusy('')
          }
        })()
      }

      function goProjects() {
        setScreen('projects')
        setProjectId(null)
        setNotice(null)
      }

      function openProject(next, targetScreen) {
        lastProjectId = next.id
        setProjectId(next.id)
        setEdit({ name: next.name, description: next.description || '' })
        setMemberOpen(false)
        setQuery('')
        setPicked('')
        setNotice(null)
        setScreen(targetScreen || 'spaces')
      }

      /** 加载项目分支（新建空间页用）。 */
      function loadBranches(target) {
        setBranchState({ status: 'loading', data: null, error: '' })
        apiGet('/api/ascoder/branches?projectId=' + encodeURIComponent(target.id))
          .then(function (data) {
            setBranchState({ status: 'ready', data: data, error: '' })
            if (data && data.current) setPicked(data.current)
          })
          .catch(function (failure) {
            setBranchState({ status: 'error', data: null, error: failure.message })
          })
      }

      /** 新建空间时：拉取各成员候选分支，给「缺该分支」的成员预选最佳候选。 */
      function loadNewSpaceMap(target, branch) {
        if (!target || !branch) return
        setNewSpaceMap({ status: 'loading', branch: branch, members: [], candidates: {}, picks: {}, error: '' })
        var query = '/api/ascoder/branch-candidates?projectId=' + encodeURIComponent(target.id)
          + '&branch=' + encodeURIComponent(branch)
        apiGet(query)
          .then(function (data) {
            var grouped = {}
            var rows = (data && data.candidates) || []
            for (var i = 0; i < rows.length; i += 1) {
              if (!grouped[rows[i].alias]) grouped[rows[i].alias] = []
              grouped[rows[i].alias].push(rows[i].branch)
            }
            var picks = {}
            var members = target.members.map(function (member) {
              var options = grouped[member.alias] || []
              if (options.indexOf(branch) !== -1) picks[member.alias] = branch
              else picks[member.alias] = options[0] || branch
              return member
            })
            setNewSpaceMap({ status: 'ready', branch: branch, members: members, candidates: grouped, picks: picks, error: '' })
          })
          .catch(function (failure) {
            setNewSpaceMap({ status: 'error', branch: branch, members: [], candidates: {}, picks: {}, error: failure.message })
          })
      }

      React.useEffect(function () {
        if (screen !== 'newSpace' || !project || picked === '') return
        loadNewSpaceMap(project, picked)
      }, [screen, picked, project])

      /** 打开某个空间的分支映射编辑器。 */
      function openSpaceBranches(target, space) {
        setProjectId(target.id)
        setScreen('spaceBranches')
        loadSpaceBranches(target, space)
      }

      /** 读取空间成员与各成员的候选分支。 */
      function loadSpaceBranches(target, space) {
        setSpaceBranch({ status: 'loading', spaceId: space.id, space: space, members: [], candidates: {}, picks: {}, error: '', notice: '' })
        var query = '?projectId=' + encodeURIComponent(target.id) + '&spaceId=' + encodeURIComponent(space.id)
        apiGet('/api/ascoder/space' + query)
          .then(function (detail) {
            var current = (detail && detail.space && detail.space.memberBranches) || {}
            var wanted = (detail.space && detail.space.branch) || space.branch
            var candQuery = '?projectId=' + encodeURIComponent(target.id)
              + '&branch=' + encodeURIComponent(wanted)
              + '&current=' + encodeURIComponent(JSON.stringify(current))
            return apiGet('/api/ascoder/branch-candidates' + candQuery).then(function (candidateData) {
              var grouped = {}
              var rows = (candidateData && candidateData.candidates) || []
              for (var i = 0; i < rows.length; i += 1) {
                var row = rows[i]
                if (!grouped[row.alias]) grouped[row.alias] = []
                grouped[row.alias].push(row.branch)
              }
              var picks = {}
              var members = (detail.members || []).map(function (member) {
                var options = grouped[member.alias] || []
                if (current[member.alias]) picks[member.alias] = current[member.alias]
                else if (options.indexOf(wanted) !== -1) picks[member.alias] = wanted
                else picks[member.alias] = options[0] || wanted
                return member
              })
              setSpaceBranch({
                status: 'ready', spaceId: space.id, space: detail.space || space,
                members: members, candidates: grouped, picks: picks, error: '', notice: '',
              })
            })
          })
          .catch(function (failure) {
            setSpaceBranch({ status: 'error', spaceId: space.id, space: space, members: [], candidates: {}, picks: {}, error: failure.message, notice: '' })
          })
      }

      /** 保存映射并按新分支重新准备。 */
      function saveSpaceBranches(target, space) {
        var mapping = {}
        var picks = spaceBranch.picks
        for (var alias in picks) {
          if (!Object.prototype.hasOwnProperty.call(picks, alias)) continue
          if (picks[alias] && picks[alias] !== space.branch) mapping[alias] = picks[alias]
        }
        run('saveSpaceBranches', async function () {
          await apiAction({ op: 'space.branches', projectId: target.id, spaceId: space.id, memberBranches: mapping })
          var data = await apiAction({ op: 'space.prepare', projectId: target.id, spaceId: space.id })
          if (data && data.taskId) {
            setSpaceBranch(function (previous) {
              return Object.assign({}, previous, { notice: '正在按新分支准备…' })
            })
            await pollTask(data.taskId, function (task) {
              setSpaceBranch(function (previous) {
                return Object.assign({}, previous, { notice: task.message || '准备中…' })
              })
            })
          }
          loadSpaceBranches(target, space)
          setNotice({ kind: 'ok', text: '分支映射已保存并重新准备' })
        })
      }

      /** 进入某个分支空间（准备失败时自动按候选分支修复一次）。 */
      function enterSpace(target, space) {
        lastProjectId = target.id
        var enterOnce = async function () {
          var data = await apiAction({ op: 'space.enter', projectId: target.id, spaceId: space.id })
          // 未就绪时后端返回准备任务，轮询完成后再次进入
          if (data && data.taskId) {
            setProgress(function (previous) { return Object.assign({}, previous, { [space.id]: '准备中…' }) })
            await pollTask(data.taskId, function (task) {
              setProgress(function (previous) {
                var next = Object.assign({}, previous)
                next[space.id] = (task.message || '准备中') + (task.progress.total > 0 ? ' · ' + task.progress.done + '/' + task.progress.total : '')
                return next
              })
            })
            setProgress(function (previous) {
              var next = Object.assign({}, previous)
              delete next[space.id]
              return next
            })
            data = await apiAction({ op: 'space.enter', projectId: target.id, spaceId: space.id })
          }
          return data
        }
        run('enter', async function () {
          var data = null
          try {
            data = await enterOnce()
          } catch (failure) {
            setProgress(function (previous) {
              var next = Object.assign({}, previous)
              next[space.id] = '准备失败，正在自动匹配分支修复…'
              return next
            })
            var plan = await apiAction({ op: 'space.autoPlan', projectId: target.id, branch: space.branch })
            if (plan && plan.taskId) {
              await pollTask(plan.taskId, function (task) {
                setProgress(function (previous) {
                  var next = Object.assign({}, previous)
                  next[space.id] = task.message || '自动修复中…'
                  return next
                })
              })
            }
            setProgress(function (previous) {
              var next = Object.assign({}, previous)
              delete next[space.id]
              return next
            })
            data = await enterOnce()
          }
          var workspaceId = data && data.workspaceId
          if (!workspaceId) throw new Error('宿主未提供工作区能力，无法进入')
          await openWorkspaceSession(workspaceId)
          rememberSpaceTitle(target.name + ' · ' + space.branch)
          setOpen(false)
        })
      }

      /** 新建分支空间并进入。 */
      function createSpaceAndEnter() {
        if (!project || picked === '') return
        var branch = picked
        lastProjectId = project.id
        var mapping = {}
        if (newSpaceMap.status === 'ready' && newSpaceMap.branch === branch) {
          for (var alias in newSpaceMap.picks) {
            if (!Object.prototype.hasOwnProperty.call(newSpaceMap.picks, alias)) continue
            if (newSpaceMap.picks[alias] && newSpaceMap.picks[alias] !== branch) mapping[alias] = newSpaceMap.picks[alias]
          }
        }
        run('createSpace', async function () {
          var space = await apiAction({
            op: 'space.create', projectId: project.id, branch: branch,
            ...(Object.keys(mapping).length > 0 ? { memberBranches: mapping } : {}),
          })
          var workspaceId = null
          var failure = null
          try {
            var data = await apiAction({ op: 'space.enter', projectId: project.id, spaceId: space.id })
            workspaceId = data && data.workspaceId
            if (!workspaceId) throw new Error('宿主未提供工作区能力，无法进入')
          } catch (error) {
            failure = error
          }

          // 新建失败时自动兜底：按候选分支重新规划并重试一次
          if (failure && space && space.id) {
            setNotice({ kind: 'ok', text: '准备失败，正在自动匹配分支修复…' })
            try {
              var plan = await apiAction({ op: 'space.autoPlan', projectId: project.id, branch: branch })
              if (plan && plan.taskId) {
                await pollTask(plan.taskId, function (task) {
                  setProgress(function (previous) {
                    return Object.assign({}, previous, { autoRepair: task.message || '自动修复中…' })
                  })
                })
              }
              setProgress(function (previous) {
                var next = Object.assign({}, previous)
                delete next.autoRepair
                return next
              })
              var retry = await apiAction({ op: 'space.enter', projectId: project.id, spaceId: space.id })
              workspaceId = retry && retry.workspaceId
              if (!workspaceId) throw failure
              setNotice({ kind: 'ok', text: '已自动匹配分支并修复空间「' + branch + '」' })
            } catch (repairFailure) {
              throw new Error(
                '新建失败，自动修复也没成功：'
                + (repairFailure && repairFailure.message ? repairFailure.message : '未知原因')
                + '。可在空间行用「分支映射」手工指定成员分支。'
              )
            }
          }

          if (!workspaceId) throw failure || new Error('宿主未提供工作区能力，无法进入')
          await openWorkspaceSession(workspaceId)
          rememberSpaceTitle(project.name + ' · ' + branch)
          setOpen(false)
        })
      }

      /** 自动匹配各成员分支并在后台创建/准备空间。 */
      function autoPlanSpace() {
        if (!project || picked === '') return
        var branch = picked
        run('autoPlan', async function () {
          var data = await apiAction({ op: 'space.autoPlan', projectId: project.id, branch: branch })
          if (data && data.taskId) {
            await pollTask(data.taskId, function (task) {
              setProgress(function (previous) {
                return Object.assign({}, previous, { autoPlan: task.message || '规划中…' })
              })
            })
          }
          setProgress(function (previous) {
            var next = Object.assign({}, previous)
            delete next.autoPlan
            return next
          })
          setScreen('spaces')
          setNotice({ kind: 'ok', text: '已按自动匹配的分支准备好空间「' + branch + '」' })
        })
      }

      // ---------------- 头部 ----------------
      var headerActions = []
      if (screen === 'projects') {
        headerActions = [
          h('button', {
            key: 'new',
            type: 'button',
            className: 'asc-btn asc-btn--primary',
            onClick: function () { setCreateOpen(!createOpen); setNotice(null) },
            'aria-expanded': createOpen ? 'true' : 'false',
            'aria-label': createOpen ? '收起新建项目' : '新建项目',
          }, createOpen ? '取消' : '新建项目'),
          h('button', {
            key: 'activity',
            type: 'button',
            className: 'asc-btn asc-btn--quiet asc-btn--icon',
            onClick: function () { setScreen('activity'); setNotice(null) },
            title: '任务与事件',
            'aria-label': '任务与事件',
          }, [
            h('svg', {
              key: 'i', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
              strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
            }, [
              h('path', { key: 'a', d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }),
              h('rect', { key: 'b', x: 9, y: 3, width: 6, height: 4, rx: 1 }),
              h('path', { key: 'c', d: 'M9 12h6' }),
              h('path', { key: 'd', d: 'M9 16h4' }),
            ]),
          ]),
          h('button', {
            key: 'repos',
            type: 'button',
            className: 'asc-btn asc-btn--quiet asc-btn--icon',
            onClick: function () { setScreen('repos'); setNotice(null) },
            title: '仓库管理',
            'aria-label': '仓库管理',
          }, [
            h('svg', {
              key: 'i', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
              strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
            }, [
              h('circle', { key: 'a', cx: 6, cy: 6, r: 2 }),
              h('circle', { key: 'b', cx: 6, cy: 18, r: 2 }),
              h('circle', { key: 'c', cx: 18, cy: 8, r: 2 }),
              h('path', { key: 'd', d: 'M6 8v8' }),
              h('path', { key: 'e', d: 'M18 10c0 3.5-4.5 3-6 4' }),
            ]),
          ]),
          h('button', {
            key: 'settings',
            type: 'button',
            className: 'asc-btn asc-btn--quiet asc-btn--icon',
            onClick: requestSettings,
            title: '设置（需要密码）',
            'aria-label': '打开设置（需要密码）',
          }, [
            h('svg', {
              key: 'i', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
              strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
            }, [
              h('circle', { key: 'c', cx: 12, cy: 12, r: 3 }),
              h('path', { key: 'p', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z' }),
            ]),
          ]),
        ]
      } else if (screen === 'spaces' && project) {
        headerActions = [
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: goProjects, 'aria-label': '返回项目列表' }, [ascIcon('back'), h('span', { key: 't' }, '返回项目')]),
          h('button', { key: 'manage', type: 'button', className: 'asc-btn', onClick: function () { openProject(project, 'settings') }, 'aria-label': '编辑项目与仓库' }, [ascIcon('gear'), h('span', { key: 't' }, '项目管理')]),
        ]
      } else if (screen === 'spaceBranches' && project) {
        headerActions = [
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: function () { setScreen('spaces') }, 'aria-label': '返回分支空间列表' }, [ascIcon('back'), h('span', { key: 't' }, '返回项目')]),
        ]
      } else if (screen === 'newSpace' && project) {
        headerActions = [
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: function () { openProject(project, 'spaces') }, 'aria-label': '返回分支空间列表' }, '返回'),
          h('button', { key: 'manage', type: 'button', className: 'asc-btn', onClick: function () { openProject(project, 'settings') }, 'aria-label': '编辑项目与仓库' }, [ascIcon('gear'), h('span', { key: 't' }, '项目管理')]),
        ]
      } else if (screen === 'activity') {
        headerActions = [
          h('button', {
            key: 'refresh', type: 'button', className: 'asc-iconBtn',
            onClick: function () { loadActivity() },
            title: '刷新任务与事件',
            'aria-label': '刷新任务与事件',
          }, [ascIcon('refresh')]),
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: goProjects, 'aria-label': '返回项目列表' }, [ascIcon('back'), h('span', { key: 't' }, '返回项目')]),
        ]
      } else if (screen === 'repos') {
        headerActions = [
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: goProjects, 'aria-label': '返回项目列表' }, [ascIcon('back'), h('span', { key: 't' }, '返回项目')]),
        ]
      } else if (screen === 'settings' && project) {
        headerActions = [
          h('button', { key: 'back', type: 'button', className: 'asc-btn', onClick: function () { openProject(project, 'spaces') }, 'aria-label': '返回分支空间列表' }, [ascIcon('back'), h('span', { key: 't' }, '返回项目')]),
          h('button', {
            key: 'list', type: 'button', className: 'asc-btn asc-btn--quiet',
            onClick: goProjects, 'aria-label': '返回项目列表',
          }, [ascIcon('folder', 14), h('span', { key: 't' }, '项目列表')]),
        ]
      }

      var headings = {
        projects: ['Ascoder', '选择一个项目；每个项目里按分支空间分别维护会话。'],
        spaces: [project ? project.name : '', project && project.description
          ? project.description
          : '选择已有分支空间，或新建一个分支空间。'],
        newSpace: [project ? project.name + ' · 选择分支' : '', '分支空间会把仓库成员按该分支物化，会话只属于这个分支。'],
        settings: [project ? project.name + ' · 项目管理' : '', '维护项目信息与仓库成员；分支空间会自动使用这些成员。'],
        spaceBranches: [project ? project.name + ' · 分支映射' : '', '分支空间里每个仓库成员可以检出不同的分支；成员缺该分支时在这里指定。'],
        repos: ['仓库管理', '登记本地或远程仓库；项目从这里挑选仓库，分支空间按选择物化。'],
        activity: ['任务与事件', '后台任务进度与领域事件流：有新事件立即刷新，运行中任务持续更新进度。'],
      }
      var heading = headings[screen] || headings.projects

      // ---------------- 各屏内容 ----------------
      var body = null

      if (screen === 'projects') {
        var createForm = createOpen
          ? h('form', {
            className: 'asc-form',
            key: 'create',
            onSubmit: function (event) {
              event.preventDefault()
              if (draft.name.trim() === '') return
              run('createProject', async function () {
                var created = await apiAction({ op: 'project.create', name: draft.name.trim(), description: draft.description.trim() })
                setCreateOpen(false)
                setDraft({ name: '', description: '' })
                if (created && created.id) openProject(created, 'spaces')
              })
            },
          }, [
            h('div', { className: 'asc-field', key: 'n' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-new-name', key: 'l' }, '项目名称'),
              h('input', {
                key: 'i', id: 'asc-new-name', className: 'asc-input', type: 'text', value: draft.name,
                placeholder: '例如：Ascoder 后端', autoComplete: 'off',
                onChange: function (event) { setDraft({ name: event.target.value, description: draft.description }) },
              }),
            ]),
            h('div', { className: 'asc-field', key: 'd' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-new-desc', key: 'l' }, '描述（可选）'),
              h('input', {
                key: 'i', id: 'asc-new-desc', className: 'asc-input', type: 'text', value: draft.description,
                placeholder: '这个项目包含哪些仓库', autoComplete: 'off',
                onChange: function (event) { setDraft({ name: draft.name, description: event.target.value }) },
              }),
            ]),
            h('div', { className: 'asc-row', key: 'a' }, [
              h('button', { key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary', disabled: busy !== '' || draft.name.trim() === '' },
                busy === 'createProject' ? '创建中…' : '创建项目'),
              h('span', { className: 'asc-hint', key: 'h' }, '创建后进入项目，添加仓库成员再开分支空间。'),
            ]),
          ])
          : null

        var cards = projects.map(function (item) {
          return h('div', { className: 'asc-projCard', key: item.id, role: 'group', 'aria-label': '项目 ' + item.name }, [
            h('button', {
              type: 'button',
              className: 'asc-projMain',
              onClick: function () { openProject(item, 'spaces') },
              'aria-label': '打开项目 ' + item.name,
            }, [
              h('span', { className: 'asc-projGlyph', key: 'g', 'aria-hidden': 'true' }, [
                h('svg', { key: 'i', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                  h('path', { key: 'p', d: 'M3 7.5A2 2 0 0 1 5 5.5h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' }),
                ]),
              ]),
              h('span', { className: 'asc-projBody', key: 'b' }, [
                (function () {
                  // 最近活动取空间里最大的 lastOpenedAt：时间放标题行右侧，是列表的常见读法
                  var latest = 0
                  ;(item.spaces || []).forEach(function (space) {
                    var at = space.lastOpenedAt ? Date.parse(space.lastOpenedAt) : NaN
                    if (Number.isFinite(at) && at > latest) latest = at
                  })
                  return h('span', { className: 'asc-projHead', key: 'h' }, [
                    h('span', { className: 'asc-projName', key: 'n' }, item.name),
                    latest
                      ? h('span', { className: 'asc-projRecent', key: 'r', title: '最近进入过这个项目的分支空间' },
                        shortTime(new Date(latest).toISOString()))
                      : null,
                  ])
                })(),
                item.description ? h('span', { className: 'asc-desc', key: 'd' }, item.description) : null,
                h('span', { className: 'asc-projStats', key: 'm' }, [
                  h('span', { className: 'asc-projStat', key: 'c' }, [
                    h('b', { key: 'v' }, String(item.memberCount)),
                    h('span', { key: 'u' }, '仓库'),
                  ]),
                  h('span', { className: 'asc-projStatSep', key: 'sep', 'aria-hidden': 'true' }, '·'),
                  h('span', { className: 'asc-projStat', key: 's' }, [
                    h('b', { key: 'v' }, String(item.spaceCount)),
                    h('span', { key: 'u' }, '分支空间'),
                  ]),
                ]),
              ]),
            ]),
            h('button', {
              type: 'button',
              className: 'asc-btn asc-btn--quiet asc-projManage',
              onClick: function () { openProject(item, 'settings') },
              'aria-label': '管理项目 ' + item.name,
            }, '管理'),
          ])
        })

        body = h('div', { className: 'asc-list', key: 'projects' }, [
          createForm,
          view.status === 'loading' && projects.length === 0
            ? h('div', {
              className: 'asc-homeLoader',
              key: 'sk',
              role: 'status',
              'aria-busy': 'true',
              'aria-label': '正在读取项目',
            }, [
              h('div', { className: 'asc-loaderScene', key: 'scene', 'aria-hidden': 'true' }, [
                h('span', { className: 'asc-loaderPulse', key: 'p1' }),
                h('span', { className: 'asc-loaderPulse asc-loaderPulse--delayed', key: 'p2' }),
                h('span', { className: 'asc-loaderOrbit', key: 'orbit' }, [
                  h('span', { className: 'asc-loaderDot', key: 'dot' }),
                ]),
                h('span', { className: 'asc-loaderBird', key: 'bird' }, [h(AscoderBird, { size: 62, live: true })]),
              ]),
              h('div', { className: 'asc-loaderTitle', key: 'title' }, '正在载入 Ascoder'),
              h('div', { className: 'asc-loaderHint', key: 'hint' }, '正在读取项目、分支空间与会话…'),
              h('div', { className: 'asc-loaderBars', key: 'bars', 'aria-hidden': 'true' }, [0, 1, 2].map(function (slot) {
                return h('span', { className: 'asc-loaderBar', key: slot })
              })),
            ])
            : null,
          projects.length === 0 && view.status !== 'loading'
            ? h('div', { className: 'asc-empty', key: 'empty' }, [
              h('div', { className: 'asc-name', key: 'a' }, '还没有项目'),
              h('div', { key: 'b' }, '新建一个项目，加入要分析的仓库，再在项目里开分支空间。'),
              h('button', {
                key: 'c', type: 'button', className: 'asc-btn asc-btn--primary',
                onClick: function () { setCreateOpen(true) }, 'aria-label': '去新建第一个项目',
              }, '新建项目'),
            ])
            : null,
          h('div', { className: 'asc-homeGrid', key: 'grid' }, cards),
        ])
      }

      /** 在项目页更新某个分支空间的代码（任务 + 行内进度）。 */
      function updateSpace(target, space) {
        run('syncSpace', async function () {
          var data = await apiAction({ op: 'space.sync', projectId: target.id, spaceId: space.id })
          if (data && data.taskId) {
            setProgress(function (previous) { return Object.assign({}, previous, { [space.id]: '更新中…' }) })
            await pollTask(data.taskId, function (task) {
              setProgress(function (previous) {
                var next = Object.assign({}, previous)
                next[space.id] = task.message || '更新中'
                return next
              })
            })
            setProgress(function (previous) {
              var next = Object.assign({}, previous)
              delete next[space.id]
              return next
            })
          }
          setNotice({ kind: 'ok', text: '代码已更新（git fetch + pull --ff-only）' })
        })
      }

      if (screen === 'spaces' && project) {
        var spaceAll = project.spaces.slice()
        var spaceQueryValue = spaceQuery.trim().toLowerCase()
        var spaceFiltered = spaceAll.filter(function (space) {
          if (spaceStatus !== 'all' && space.status !== spaceStatus) return false
          if (spaceQueryValue && space.branch.toLowerCase().indexOf(spaceQueryValue) < 0) return false
          return true
        })
        spaceFiltered.sort(function (a, b) {
          if (spaceSort === 'name') return a.branch.localeCompare(b.branch)
          if (spaceSort === 'created') return (b.createdAt || '').localeCompare(a.createdAt || '')
          var left = a.lastOpenedAt || a.createdAt || ''
          var right = b.lastOpenedAt || b.createdAt || ''
          return right.localeCompare(left)
        })

        /** 分支前缀分组键：hotfix/5.7.x → hotfix/；没有斜杠归到「其他分支」。 */
        var spacePrefix = function (branch) {
          var slash = branch.indexOf('/')
          return slash > 0 ? branch.slice(0, slash + 1) : '其他分支'
        }
        var spaceGroups = []
        var spaceGroupIndex = {}
        for (var sg = 0; sg < spaceFiltered.length; sg += 1) {
          var groupKey = spacePrefix(spaceFiltered[sg].branch)
          if (!spaceGroupIndex[groupKey]) {
            spaceGroupIndex[groupKey] = { key: groupKey, spaces: [] }
            spaceGroups.push(spaceGroupIndex[groupKey])
          }
          spaceGroupIndex[groupKey].spaces.push(spaceFiltered[sg])
        }
        spaceGroups.sort(function (a, b) {
          if (a.key === '其他分支') return 1
          if (b.key === '其他分支') return -1
          return spaceSort === 'name' ? a.key.localeCompare(b.key) : 0
        })
        var showSpaceGroups = spaceGroups.length > 1

        /** 为某个空间建立或更新 CodeGraph 索引：不占用全局 busy，进入会话等操作始终可用。 */
        var indexSpace = function (space) {
          return function () {
            ;(async function () {
              try {
                var info = indexInfo[space.id]
                var mode = info && info.total > 0 && info.indexed >= info.total ? 'update' : undefined
                setIndexInfo(function (previous) {
                  return Object.assign({}, previous, { [space.id]: Object.assign({}, previous[space.id] || {}, { running: '索引任务已排队…' }) })
                })
                var data = await apiAction({ op: 'codegraph.index', projectId: project.id, spaceId: space.id, ...(mode ? { mode } : {}) })
                if (data && data.taskId) {
                  await pollTask(data.taskId, function (task) {
                    setIndexInfo(function (previous) {
                      return Object.assign({}, previous, { [space.id]: Object.assign({}, previous[space.id] || {}, { running: task.message || '索引中…' }) })
                    })
                  })
                  setNotice({ kind: 'ok', text: '「' + space.branch + '」索引已更新' })
                }
                loadIndexInfo()
              } catch (failure) {
                setIndexInfo(function (previous) {
                  var next = Object.assign({}, previous)
                  if (next[space.id]) next[space.id] = Object.assign({}, next[space.id], { running: null })
                  return next
                })
                setNotice({ text: failure.message })
              }
            })()
          }
        }

        /** 自动修复某个空间的成员分支映射。 */
        var autoFixSpace = function (space) {
          return function () {
            run('autoPlan', async function () {
              var data = await apiAction({ op: 'space.autoPlan', projectId: project.id, branch: space.branch })
              if (data && data.taskId) {
                await pollTask(data.taskId, function (task) {
                  setProgress(function (previous) {
                    return Object.assign({}, previous, { [space.id]: task.message || '自动修复中…' })
                  })
                })
              }
              setProgress(function (previous) {
                var next = Object.assign({}, previous)
                delete next[space.id]
                return next
              })
              setNotice({ kind: 'ok', text: '已按候选分支自动修复空间「' + space.branch + '」' })
            })
          }
        }

        /** 一行分支空间：紧凑排布 + 「更多操作」入口。 */
        var spaceRow = function (space, rowIndex) {
          var opened = Boolean(spaceMenu && spaceMenu.id === space.id)
          return h('div', {
            className: 'asc-spaceRow asc-spaceRow--compact',
            key: space.id,
            role: 'group',
            'aria-label': '分支空间 ' + space.branch,
            title: '点击进入分支空间 ' + space.branch,
            style: { animationDelay: (rowIndex * 40) + 'ms' },
            onClick: function (event) {
              var target = event.target
              // 内部按钮/菜单/输入框自己处理点击，避免进入两次
              if (target && target.closest && target.closest('.asc-spaceActions, button, a, input, select, textarea')) return
              if (busy !== '') return
              enterSpace(project, space)
            },
          }, [
            h('div', { className: 'asc-spaceMain', key: 'm' }, [
              h('div', { className: 'asc-spaceName', key: 'n' }, [
                h('span', { className: 'asc-branchName', key: 'b' }, space.branch),
                h(SpacePill, { key: 'p', status: space.status }),
                space.lastOpenedAt
                  ? h('span', { key: 't', className: 'asc-spaceAge', title: absoluteTime(space.lastOpenedAt) }, shortTime(space.lastOpenedAt))
                  : h('span', { key: 't', className: 'asc-spaceAge' }, '尚未进入'),
              ]),
              h('div', { className: 'asc-meta', key: 'd' }, [
                h('span', {
                  key: 'c',
                  className: 'asc-metaItem',
                  title: space.preparedCount + '/' + space.memberCount + ' 个仓库已准备',
                }, [
                  ascIcon('check', 12),
                  h('span', { key: 't' }, space.preparedCount + '/' + space.memberCount + ' 仓库'),
                ]),
                progress[space.id]
                  ? h('span', { key: 'p', className: 'asc-pill' }, progress[space.id])
                  : null,
                (function () {
                  var info = indexInfo[space.id]
                  if (!info) {
                    // 覆盖详情要先跑一次 codegraph status（3 成员约 4 秒）：
                    // 先按空间自身的 indexStatus 出徽章，完全未知时给脉冲骨架，避免空白等待
                    var fallback = space.indexStatus
                    if (fallback === 'indexing') {
                      return h('span', { key: 'ix', className: 'asc-indexChip asc-indexChip--busy', title: '正在建立代码索引', 'aria-label': '正在建立代码索引' }, [
                        h('span', { key: 'b', className: 'asc-indexBird', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 12, live: true })]),
                        h('span', { key: 't' }, '索引中'),
                      ])
                    }
                    if (fallback === 'ready') {
                      return h('span', { key: 'ix', className: 'asc-indexChip asc-indexChip--ok', title: '语义索引已就绪（覆盖详情加载中）', 'aria-label': '语义索引已就绪' }, [
                        ascIcon('check', 12),
                        h('span', { key: 't' }, '已索引'),
                      ])
                    }
                    if (fallback === 'stale') {
                      return h('button', {
                        key: 'ix',
                        type: 'button',
                        className: 'asc-indexChip asc-indexChip--stale asc-indexChip--btn',
                        title: '代码比索引新，语义检索结果可能过时；点击更新索引',
                        'aria-label': '语义索引已过期，点击更新',
                        onClick: function (event) {
                          event.stopPropagation()
                          indexSpace(space)()
                        },
                      }, [ascIcon('refresh', 12), h('span', { key: 't' }, '更新索引')])
                    }
                    if (fallback === 'none') {
                      return h('button', {
                        key: 'ix',
                        type: 'button',
                        className: 'asc-indexChip asc-indexChip--btn',
                        title: '还没有建立语义索引；点击建立',
                        'aria-label': '语义索引未建立，点击建立',
                        onClick: function (event) {
                          event.stopPropagation()
                          indexSpace(space)()
                        },
                      }, [ascIcon('graph', 12), h('span', { key: 't' }, '索引')])
                    }
                    return h('span', { key: 'ix', className: 'asc-indexChip asc-indexChip--loading', 'aria-busy': 'true', 'aria-label': '正在读取索引状态' }, [
                      h('span', { key: 'd', className: 'asc-indexChipDot', 'aria-hidden': 'true' }),
                      h('span', { key: 't' }, '索引状态加载中'),
                    ])
                  }
                  if (info.running) {
                    return h('span', { key: 'ix', className: 'asc-indexChip asc-indexChip--busy', title: info.running, 'aria-label': '正在建立代码索引' }, [
                      h('span', { key: 'b', className: 'asc-indexBird', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 12, live: true })]),
                      h('span', { key: 't' }, '索引中'),
                    ])
                  }
                  if (!info.total) return null
                  var ready = info.indexed >= info.total
                  var stat = info.files !== undefined ? '（' + info.files + ' 个文件' + (info.symbols !== undefined ? ' / ' + info.symbols + ' 个节点' : '') + '）' : ''
                  // 索引状态由后端维护：none / indexing / ready / stale（代码比索引新）
                  var indexStatus = info.indexStatus || (ready ? 'ready' : 'none')
                  if (indexStatus === 'stale') {
                    // 过期直接可点：触发增量更新，不用再去 ⋯ 菜单找
                    return h('button', {
                      key: 'ix',
                      type: 'button',
                      className: 'asc-indexChip asc-indexChip--stale asc-indexChip--btn',
                      title: '代码比索引新，语义检索结果可能过时；点击更新索引',
                      'aria-label': '语义索引已过期，点击更新',
                      onClick: function (event) {
                        event.stopPropagation()
                        indexSpace(space)()
                      },
                    }, [
                      ascIcon('refresh', 12),
                      h('span', { key: 't' }, '更新索引'),
                    ])
                  }
                  if (indexStatus === 'ready' || ready) {
                    return h('button', {
                      key: 'ix',
                      type: 'button',
                      className: 'asc-indexChip asc-indexChip--ok asc-indexChip--btn',
                      title: '已就绪' + (stat || '') + '；点击查看覆盖情况',
                      'aria-label': '语义索引已就绪，点击查看覆盖情况',
                      onClick: function (event) {
                        event.stopPropagation()
                        setNotice({
                          kind: 'ok',
                          text: '「' + space.branch + '」已索引' + (stat || '') + '；需要刷新时用右上的 ⋯ 菜单「更新索引」',
                        })
                      },
                    }, [ascIcon('check', 12), h('span', { key: 't' }, '已索引')])
                  }
                  return h('button', {
                    key: 'ix',
                    type: 'button',
                    className: 'asc-indexChip asc-indexChip--btn',
                    title: '还有 ' + (info.total - info.indexed) + ' 个仓库没有索引；点击建立索引',
                    'aria-label': '语义索引 ' + info.indexed + '/' + info.total + '，点击建立索引',
                    onClick: function (event) {
                      event.stopPropagation()
                      indexSpace(space)()
                    },
                  }, [
                    ascIcon('graph', 12),
                    h('span', { key: 't' }, '索引 ' + info.indexed + '/' + info.total),
                  ])
                })(),
                space.error ? h('span', { key: 'e', className: 'asc-hint--error' }, space.error) : null,
              ]),
            ]),
            h('div', { className: 'asc-spaceActions', key: 'a' }, [
              h('button', {
                key: 'enter', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--lead asc-spaceEnter',
                onClick: function () { enterSpace(project, space) },
                disabled: busy !== '',
                'aria-label': '进入分支空间 ' + space.branch,
              }, [ascIcon('arrow'), h('span', { key: 't' }, busy === 'enter' ? '进入中…' : '进入')]),
              h('button', {
                key: 'more', type: 'button',
                className: 'asc-iconBtn asc-iconBtn--more' + (opened ? ' asc-iconBtn--open' : ''),
                onClick: function (event) {
                  if (opened) {
                    setSpaceMenu(null)
                    return
                  }
                  // 菜单渲染在列表容器里（行容器有 overflow:hidden 和 transform，fixed 会被裁掉）
                  var rect = event.currentTarget.getBoundingClientRect()
                  var list = event.currentTarget.closest('.asc-list')
                  var listRect = list ? list.getBoundingClientRect() : { left: 0, top: 0 }
                  var scrollTop = list ? list.scrollTop : 0
                  var menuWidth = 186
                  var estimatedHeight = 150
                  var nodeX = rect.right - listRect.left - menuWidth
                  var below = rect.bottom - listRect.top + scrollTop + 6
                  var above = rect.top - listRect.top + scrollTop - estimatedHeight - 6
                  var maxX = (list ? list.clientWidth : window.innerWidth) - menuWidth - 12
                  setSpaceMenu({
                    id: space.id,
                    x: Math.max(8, Math.min(nodeX, maxX)),
                    y: below + estimatedHeight > (list ? list.clientHeight + scrollTop : window.innerHeight) ? Math.max(8, above) : below,
                  })
                },
                'aria-haspopup': 'menu',
                'aria-expanded': opened ? 'true' : 'false',
                title: '更多操作',
                'aria-label': '分支空间 ' + space.branch + ' 的更多操作',
              }, [ascIcon('more')]),

            ]),
          ])
        }

        var statusChoices = [['all', '全部'], ['ready', '就绪'], ['unprepared', '待准备'], ['failed', '失败']]
        var sortChoices = [['recent', '最近使用'], ['name', '名称'], ['created', '创建时间']]
        var spaceToolbar = h('div', { className: 'asc-spaceTools', key: 'tools' }, [
          h('label', { className: 'asc-search', key: 'q' }, [
            ascIcon('search', 14),
            h('input', {
              className: 'asc-searchInput',
              type: 'search',
              value: spaceQuery,
              placeholder: '搜索分支…',
              'aria-label': '搜索分支空间',
              onChange: function (event) { setSpaceQuery(event.target.value) },
            }),
          ]),
          h('span', { className: 'asc-toolsLabel', key: 'fl' }, '状态'),
          h('div', { className: 'asc-filters', key: 'f' }, statusChoices.map(function (choice) {
            var active = spaceStatus === choice[0]
            return h('button', {
              key: choice[0], type: 'button',
              className: 'asc-filterChip' + (active ? ' asc-filterChip--active' : ''),
              onClick: function () { setSpaceStatus(choice[0]) },
              'aria-pressed': active ? 'true' : 'false',
            }, choice[1])
          })),
          h('span', { className: 'asc-toolsLabel', key: 'sl' }, '排序'),
          // 排序用下拉而不是三个 chip：窄屏下工具栏不再折行
          h('select', {
            key: 's',
            className: 'asc-input asc-select asc-sortSelect',
            value: spaceSort,
            'aria-label': '排序方式',
            onChange: function (event) { setSpaceSort(event.target.value) },
          }, sortChoices.map(function (choice) {
            return h('option', { key: choice[0], value: choice[0] }, choice[1])
          })),
          h('span', { className: 'asc-hint', key: 'c' }, '显示 ' + spaceFiltered.length + ' / ' + spaceAll.length),
        ])

        var spaceContent = spaceFiltered.length === 0
          ? h('div', { className: 'asc-empty', key: 'empty' }, [
            h('div', { className: 'asc-name', key: 'a' }, spaceAll.length === 0 ? '还没有分支空间' : '没有匹配的分支空间'),
            h('div', { key: 'b' }, spaceAll.length === 0
              ? '新建一个分支空间：选择分支后会把仓库成员按该分支准备好，然后就能开始对话。'
              : '没有符合当前筛选（关键词或状态）的分支空间。'),
            spaceAll.length > 0
              ? h('div', { key: 'c', className: 'asc-row', style: { marginTop: '10px' } }, [
                h('button', {
                  key: 'clear',
                  type: 'button',
                  className: 'asc-btn asc-btn--sm',
                  onClick: function () { setSpaceQuery(''); setSpaceStatus('all') },
                }, '清除筛选'),
              ])
              : null,
          ])
          : showSpaceGroups
            ? h('div', { className: 'asc-spaceGroups', key: 'groups' }, spaceGroups.map(function (group) {
              return h('section', { className: 'asc-spaceGroup', key: group.key }, [
                h('div', { className: 'asc-spaceGroupHead', key: 'h' }, [
                  h('span', { className: 'asc-spaceGroupTitle', key: 't' }, group.key),
                  h('span', { className: 'asc-hint', key: 'c' }, group.spaces.length + ' 个'),
                ]),
                h('div', {
                className: 'asc-rows',
                key: 'r',
                onKeyDown: function (event) {
                  if (!spaceMenu) return
                  menuKeyboard(function () { setSpaceMenu(null) })(event)
                },
              }, group.spaces.map(function (space, rowIndex) {
                return spaceRow(space, rowIndex)
              })),
              ])
            }))
            : h('div', {
              className: 'asc-rows',
              key: 'rows',
              onKeyDown: function (event) {
                if (!spaceMenu) return
                menuKeyboard(function () { setSpaceMenu(null) })(event)
              },
            }, spaceFiltered.map(function (space, rowIndex) {
              return spaceRow(space, rowIndex)
            }))

        var menuSpace = null
        if (spaceMenu) {
          for (var mi = 0; mi < spaceAll.length; mi += 1) {
            if (spaceAll[mi].id === spaceMenu.id) { menuSpace = spaceAll[mi]; break }
          }
        }
        var menuItemRender = function (iconName, label, action, danger, first) {
          return h('button', {
            key: label, type: 'button', role: 'menuitem',
            className: 'asc-spaceMenuItem' + (danger ? ' asc-spaceMenuItem--danger' : ''),
            autoFocus: first === true,
            'aria-label': label,
            onClick: function () { setSpaceMenu(null); action() },
          }, [ascIcon(iconName, 14), h('span', { key: 't' }, label)])
        }
        var spaceMenuPanel = menuSpace
          ? h('div', {
            className: 'asc-spaceMenu',
            role: 'menu',
            key: 'spaceMenu',
            'aria-label': menuSpace.branch + ' 的操作',
            onKeyDown: menuKeyboard(function () { setSpaceMenu(null) }),
            style: { left: spaceMenu.x + 'px', top: spaceMenu.y + 'px' },
          }, [
            menuItemRender('refresh', '更新代码', function () { updateSpace(project, menuSpace) }, false, true),
            menuItemRender('graph', (function () {
              var info = indexInfo[menuSpace.id]
              return info && info.total > 0 && info.indexed >= info.total ? '更新索引' : '建立索引'
            })(), indexSpace(menuSpace)),
            menuItemRender('link', '分支映射', function () { openSpaceBranches(project, menuSpace) }),
            menuSpace.status === 'failed' ? menuItemRender('tool', '自动修复', autoFixSpace(menuSpace)) : null,
            menuItemRender('trash', '删除分支空间', function () {
              if (typeof window !== 'undefined' && typeof window.confirm === 'function'
                && !window.confirm('删除分支空间「' + menuSpace.branch + '」？空间目录会被移除，仓库本体不受影响。')) return
              run('deleteSpace', function () { return apiAction({ op: 'space.remove', projectId: project.id, spaceId: menuSpace.id }) })
            }, true),
          ])
          : null

        body = h('div', { className: 'asc-list', key: 'spaces' }, [
          h('div', { className: 'asc-row', key: 'top' }, [
            h('button', {
              key: 'new', type: 'button', className: 'asc-btn asc-btn--primary asc-btn--lead',
              onClick: function () { setScreen('newSpace'); loadBranches(project) },
              disabled: project.memberCount === 0,
              'aria-label': '新建分支空间',
            }, [ascIcon('plus'), h('span', { key: 't' }, '新建分支空间')]),
            project.memberCount === 0
              ? h('span', { className: 'asc-hint asc-hint--icons', key: 'h' }, [
                ascIcon('folder', 13),
                h('span', { key: 't' }, '先到「项目管理」添加仓库成员'),
              ])
              : h('span', { className: 'asc-hint asc-hint--icons', key: 'h' }, [
                ascIcon('folder', 13),
                h('span', { key: 'a' }, project.memberCount + ' 个仓库成员'),
                h('span', { key: 'sep', className: 'asc-dot', 'aria-hidden': 'true' }),
                ascIcon('branch', 13),
                h('span', { key: 'b' }, project.spaceCount + ' 个分支空间'),
              ]),
          ]),
          spaceAll.length > 0 ? spaceToolbar : null,
          spaceContent,
          spaceMenuPanel,
        ])
      }

      if (screen === 'newSpace' && project) {
        var branchList = (branchState.data && branchState.data.local) || []
        var remoteList = (branchState.data && branchState.data.remote) || []
        var allBranches = branchList.concat(remoteList.filter(function (name) { return branchList.indexOf(name) < 0 }))
        var existing = {}
        project.spaces.forEach(function (space) { existing[space.branch] = true })
        var needle = query.trim().toLowerCase()
        var visible = allBranches.filter(function (name) { return needle === '' || name.toLowerCase().indexOf(needle) >= 0 })
        var groups = groupBranches(visible)

        var content = null
        if (branchState.status === 'loading') {
          content = h('div', { className: 'asc-skeleton', key: 'sk', role: 'status', 'aria-busy': 'true', 'aria-label': '正在读取分支' },
            [0, 1, 2].map(function (slot) { return h('div', { className: 'asc-skelCard', key: slot, style: { height: '44px' } }) }))
        } else if (branchState.status === 'error') {
          content = h('div', { className: 'asc-error', role: 'alert', key: 'err' }, [h('span', { key: 'm' }, branchState.error || '分支读取失败')])
        } else if (allBranches.length === 0) {
          content = h('div', { className: 'asc-empty', key: 'none' }, [
            h('div', { className: 'asc-name', key: 'a' }, '没有可用分支'),
            h('div', { key: 'b' }, '项目还没有仓库成员，先到「项目管理」添加仓库。'),
          ])
        } else {
          content = h('div', { className: 'asc-groups', key: 'groups' }, groups.map(function (group) {
            return h('div', { className: 'asc-group', key: group.key }, [
              h('div', { className: 'asc-groupTitle', key: 't' }, [
                h('span', { key: 'k' }, group.key === '其他' ? '其他' : group.key + '/'),
                h('span', { className: 'asc-groupCount', key: 'c' }, String(group.branches.length)),
              ]),
              h('div', { className: 'asc-branchGrid', key: 'g' }, group.branches.map(function (name) {
                var active = picked === name
                return h('button', {
                  key: name, type: 'button',
                  className: 'asc-branchRow' + (active ? ' asc-branchRow--active' : ''),
                  onClick: function () { setPicked(name) },
                  'aria-pressed': active ? 'true' : 'false',
                  'aria-label': '选择分支 ' + name,
                }, [
                  h('span', { className: 'asc-branchName', key: 'n', title: name }, name),
                  existing[name] ? h('span', { className: 'asc-pill', key: 'e' }, '已有空间') : null,
                ])
              })),
            ])
          }))
        }

        body = h('div', { className: 'asc-list', key: 'newSpace' }, [
          h('div', { className: 'asc-searchRow', key: 's' }, [
            h('label', { className: 'asc-sr', htmlFor: 'asc-branch-search', key: 'l' }, '搜索分支'),
            h('input', {
              key: 'i', id: 'asc-branch-search', className: 'asc-input', type: 'search', value: query,
              placeholder: '搜索分支（' + allBranches.length + ' 个）', autoComplete: 'off', spellCheck: 'false',
              onChange: function (event) { setQuery(event.target.value) },
            }),
          ]),
          content,
          picked !== '' && newSpaceMap.status !== 'idle'
            ? h('div', { className: 'asc-section', key: 'map' }, [
              h('div', { className: 'asc-sectionHead', key: 'h' }, [
                h('h3', { className: 'asc-sectionTitle', key: 't' }, '成员分支'),
                h('span', { className: 'asc-hint', key: 'c' },
                  newSpaceMap.status === 'loading' ? '读取候选…' : '缺该分支的成员已自动预选，可改'),
              ]),
              newSpaceMap.error ? h('div', { className: 'asc-hint asc-hint--error', key: 'e' }, newSpaceMap.error) : null,
              newSpaceMap.status === 'ready'
                ? h('div', { className: 'asc-rows', key: 'rows' }, newSpaceMap.members.map(function (member) {
                  var options = newSpaceMap.candidates[member.alias] || []
                  var value = newSpaceMap.picks[member.alias] || picked
                  var lacks = options.length > 0 && options.indexOf(newSpaceMap.branch) === -1
                  return h('div', { className: 'asc-spaceRow', key: member.alias }, [
                    h('div', { className: 'asc-spaceMain', key: 'm' }, [
                      h('div', { className: 'asc-spaceName', key: 'n' }, [
                        h('span', { className: 'asc-branchName', key: 'b' }, member.alias),
                        lacks ? h('span', { key: 'w', className: 'asc-pill' }, '无该分支') : null,
                      ]),
                    ]),
                    h('div', { className: 'asc-spaceActions', key: 'a' }, [
                      h('select', {
                        key: 's', className: 'asc-input asc-branchSelect', value: value,
                        'aria-label': '选择 ' + member.alias + ' 的分支',
                        onChange: function (event) {
                          var next = Object.assign({}, newSpaceMap.picks)
                          next[member.alias] = event.target.value
                          setNewSpaceMap(Object.assign({}, newSpaceMap, { picks: next }))
                        },
                      }, options.map(function (name) {
                        return h('option', { key: name, value: name }, name === newSpaceMap.branch ? name + '（空间分支）' : name)
                      })),
                    ]),
                  ])
                }))
                : null,
            ])
            : null,
          h('div', { className: 'asc-homeFoot', key: 'f' }, [
            h('span', { className: 'asc-hint', key: 'h' }, picked ? '将创建分支空间：' + picked : '先选一个分支'),
            h('button', {
              key: 'auto', type: 'button', className: 'asc-btn',
              onClick: autoPlanSpace,
              disabled: busy !== '' || picked === '',
              'aria-label': '自动匹配各成员分支并创建空间',
            }, busy === 'autoPlan' ? '规划中…' : '自动匹配并创建'),
            h('button', {
              key: 'go', type: 'button', className: 'asc-btn asc-btn--primary',
              onClick: createSpaceAndEnter,
              disabled: busy !== '' || picked === '',
              'aria-label': '创建分支空间并进入',
            }, busy === 'createSpace' ? '准备中…' : '创建并进入'),
          ]),
        ])
      }

      if (screen === 'activity') {
        var taskStatusText = { queued: '排队中', running: '执行中', succeeded: '成功', failed: '失败', cancelled: '已取消' }
        var taskKindText = {
          'codegraph.index': '代码索引',
          'space.prepare': '准备空间',
          'space.sync': '更新代码',
          'space.clone': '克隆仓库',
          'repository.sync': '同步仓库',
        }
        var eventText = {
          'project.created': '创建项目',
          'project.updated': '更新项目',
          'project.removed': '删除项目',
          'repository.added': '登记仓库',
          'repository.removed': '删除仓库',
          'repository.synced': '同步仓库',
          'space.created': '新建分支空间',
          'space.removed': '删除分支空间',
          'space.prepared': '空间准备完成',
          'space.failed': '空间准备失败',
          'space.synced': '空间代码已更新',
          'knowledge.forgotten': '删除知识条目',
          'task.started': '任务开始',
          'task.succeeded': '任务成功',
          'task.failed': '任务失败',
        }

        var runningRows = activity.running.map(function (task, index) {
          var percent = task.progress.total > 0 ? Math.round((task.progress.done / task.progress.total) * 100) : 0
          return h('div', {
            className: 'asc-taskRow',
            key: task.id,
            style: { animationDelay: (index * 45) + 'ms' },
          }, [
            h('div', { className: 'asc-taskHead', key: 'h' }, [
              h('span', { className: 'asc-name', key: 't' }, task.title),
              h('span', { className: 'asc-pill', key: 'k' }, taskKindText[task.kind] || task.kind),
              h('span', { className: 'asc-pill asc-pill--stale', key: 's' }, taskStatusText[task.status] || task.status),
              h('button', {
                key: 'c', type: 'button', className: 'asc-iconBtn asc-iconBtn--danger',
                onClick: function (id) {
                  return function () {
                    apiAction({ op: 'task.cancel', taskId: id }).then(loadActivity).catch(function () {})
                  }
                }(task.id),
                title: '取消该任务',
                'aria-label': '取消任务 ' + task.title,
              }, [ascIcon('close')]),
            ]),
            h('div', { className: 'asc-progress', key: 'p' }, [
              h('div', { className: 'asc-progressBar', key: 'b', style: { width: percent + '%' } }),
            ]),
            h('div', { className: 'asc-meta', key: 'm' }, [
              h('span', { key: 'bird', className: 'asc-taskBird', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 14, live: true })]),
              h('span', { key: 'msg' }, task.message || '准备中…'),
              h('span', { key: 'c' }, percent + '%'),
              (function () {
                var startedAt = task.startedAt || task.createdAt
                if (!startedAt) return null
                var elapsed = Date.now() - new Date(startedAt).getTime()
                if (!isFinite(elapsed) || elapsed < 0) return null
                return h('span', { key: 'd', title: '已运行', className: 'asc-taskElapsed' }, '已运行 ' + durationText(elapsed))
              })(),
            ]),
          ])
        })

        // 任务筛选与分页：种类筛选 + 每页 10 条
        var TASK_PAGE_SIZE = 10
        var taskFilterGroups = {
          all: null,
          prepare: ['space.prepare', 'space.clone'],
          sync: ['space.sync', 'repository.sync'],
          codegraph: ['codegraph.index'],
          failed: '@failed',
        }
        var taskKinds = taskFilterGroups[taskFilter]
        var filteredTasks = taskKinds === '@failed'
          ? activity.tasks.filter(function (task) { return task.status === 'failed' })
          : taskKinds
            ? activity.tasks.filter(function (task) { return taskKinds.indexOf(task.kind) >= 0 })
            : activity.tasks
        var taskPageCount = Math.max(1, Math.ceil(filteredTasks.length / TASK_PAGE_SIZE))
        var safeTaskPage = Math.min(taskPage, taskPageCount - 1)
        var taskPageStart = safeTaskPage * TASK_PAGE_SIZE
        var pageTasks = filteredTasks.slice(taskPageStart, taskPageStart + TASK_PAGE_SIZE)

        var historyRows = pageTasks.map(function (task) {
          return h('div', { className: 'asc-eventRow asc-taskHistoryRow', key: task.id }, [
            h('span', { className: 'asc-eventTime', key: 't' }, shortTime(task.finishedAt || task.createdAt)),
            h('span', { className: 'asc-eventType', key: 'k' }, taskKindText[task.kind] || task.kind),
            h('span', { className: 'asc-eventBody', key: 'b' }, task.title + (task.error ? ' · ' + task.error : '')),
            (function () {
              var began = task.startedAt || task.createdAt
              var ended = task.finishedAt
              if (!began || !ended) return null
              var spent = new Date(ended).getTime() - new Date(began).getTime()
              if (!isFinite(spent) || spent < 0) return null
              return h('span', { className: 'asc-taskSpent', key: 'd', title: '耗时' }, durationText(spent))
            })(),
            h('span', {
              className: 'asc-pill ' + (task.status === 'succeeded' ? 'asc-pill--ready' : task.status === 'failed' ? 'asc-pill--failed' : ''),
              key: 's',
            }, taskStatusText[task.status] || task.status),
          ])
        })

        var EVENT_PAGE_SIZE = 10
        var allNewest = activity.events.slice().reverse()
        var filterGroups = {
          all: null,
          task: ['task.started', 'task.succeeded', 'task.failed'],
          space: ['space.created', 'space.removed', 'space.prepared', 'space.failed', 'space.synced'],
          project: ['project.created', 'project.updated', 'project.removed'],
          repository: ['repository.added', 'repository.removed', 'repository.synced'],
          failure: ['task.failed', 'space.failed'],
          knowledge: ['knowledge.forgotten'],
        }
        var filterTypes = filterGroups[eventFilter]
        var newestFirst = filterTypes ? allNewest.filter(function (event) { return filterTypes.indexOf(event.type) >= 0 }) : allNewest
        var pageCount = Math.max(1, Math.ceil(newestFirst.length / EVENT_PAGE_SIZE))
        var safePage = Math.min(eventPage, pageCount - 1)
        var pageStart = safePage * EVENT_PAGE_SIZE
        var pageEvents = newestFirst.slice(pageStart, pageStart + EVENT_PAGE_SIZE)
        var eventRows = pageEvents.map(function (event) {
          var payload = Object.keys(event.payload || {}).map(function (key) {
            var value = event.payload[key]
            return typeof value === 'string' ? value : ''
          }).filter(Boolean).slice(0, 2).join(' · ')
          return h('div', { className: 'asc-eventRow', key: event.id }, [
            h('span', { className: 'asc-eventTime', key: 't' }, shortTime(event.at)),
            h('span', { className: 'asc-eventType', key: 'k' }, eventText[event.type] || event.type),
            h('span', { className: 'asc-eventBody', key: 'b' }, payload),
          ])
        })

        var storageWarning = null
        try {
          var storage = view.data && view.data.storage
          if (storage && storage.mode === 'file') {
            storageWarning = h('div', {
              className: 'asc-storageWarn',
              role: 'alert',
              key: 'storage',
            }, [
              h('span', { key: 'i', className: 'asc-storageWarnIcon', 'aria-hidden': 'true' }, '⚠'),
              h('span', { key: 't' },
                '本实例在用本地文件兜底存储（共享存储被另一个 Ascoder 进程占用），'
                + '这里看到的任务与事件和那个实例不互通。建议只保留一个实例，关掉多余的 dsh 进程。'),
            ])
          }
        } catch (error) { /* 状态缺失时忽略 */ }

        body = h('div', { className: 'asc-list', key: 'activity' }, [
          storageWarning,
          activity.status === 'error'
            ? h('div', { className: 'asc-error', role: 'alert', key: 'err' }, [h('span', { key: 'm' }, activity.error)])
            : null,
          h('section', { className: 'asc-section', key: 'running' }, [
            h('div', { className: 'asc-sectionHead', key: 'h' }, [
              h('h3', { className: 'asc-sectionTitle', key: 't' }, '运行中（' + activity.running.length + '）'),
            ]),
            runningRows.length > 0
              ? h('div', { className: 'asc-rows', key: 'rows' }, runningRows)
              : h('div', { className: 'asc-hint', key: 'empty' }, '当前没有运行中的任务'),
          ]),
          h('section', { className: 'asc-section', key: 'history' }, [
            h('div', { className: 'asc-sectionHead', key: 'h' }, [
              h('h3', { className: 'asc-sectionTitle', key: 't' }, '最近任务'),
              h('span', { className: 'asc-hint', key: 'c' }, '显示 ' + filteredTasks.length + ' / ' + activity.tasks.length),
            ]),
            h('div', { className: 'asc-filters', key: 'filters' }, [
              [['all', '全部'], ['prepare', '准备空间'], ['sync', '更新代码'], ['codegraph', '代码索引'], ['failed', '失败']].map(function (item) {
                var active = taskFilter === item[0]
                return h('button', {
                  key: item[0],
                  type: 'button',
                  className: 'asc-filterChip' + (active ? ' asc-filterChip--active' : ''),
                  onClick: function () { setTaskFilter(item[0]); setTaskPage(0) },
                  'aria-pressed': active ? 'true' : 'false',
                  'aria-label': '筛选任务：' + item[1],
                }, item[1])
              }),
            ]),
            historyRows.length > 0
              ? h('div', { className: 'asc-rows', key: 'rows' }, historyRows)
              : h('div', { className: 'asc-hint', key: 'empty' }, '该筛选下没有任务记录'),
            filteredTasks.length > TASK_PAGE_SIZE
              ? h('div', { className: 'asc-pager', key: 'taskPager' }, [
                h('span', { className: 'asc-hint', key: 'info' },
                  '第 ' + (taskPageStart + 1) + '–' + (taskPageStart + pageTasks.length) + ' 条，共 ' + filteredTasks.length + ' 条'),
                h('div', { className: 'asc-actions', key: 'btns' }, [
                  h('button', {
                    key: 'prev', type: 'button', className: 'asc-btn',
                    onClick: function () { setTaskPage(Math.max(0, safeTaskPage - 1)) },
                    disabled: safeTaskPage === 0,
                    'aria-label': '上一页任务',
                  }, '上一页'),
                  h('span', { className: 'asc-hint', key: 'p' }, '第 ' + (safeTaskPage + 1) + ' / ' + taskPageCount + ' 页'),
                  h('button', {
                    key: 'next', type: 'button', className: 'asc-btn',
                    onClick: function () { setTaskPage(Math.min(taskPageCount - 1, safeTaskPage + 1)) },
                    disabled: safeTaskPage >= taskPageCount - 1,
                    'aria-label': '下一页任务',
                  }, '下一页'),
                ]),
              ])
              : null,
          ]),
          h('section', { className: 'asc-section', key: 'events' }, [
            h('div', { className: 'asc-sectionHead', key: 'h' }, [
              h('h3', { className: 'asc-sectionTitle', key: 't' }, '事件流'),
              h('span', { className: 'asc-hint', key: 'c' }, '游标 ' + activity.cursor),
            ]),
            h('div', { className: 'asc-filters', key: 'filters' }, [
              [['all', '全部'], ['task', '任务'], ['space', '空间'], ['project', '项目'], ['repository', '仓库'], ['knowledge', '知识'], ['failure', '失败']].map(function (item) {
                var active = eventFilter === item[0]
                return h('button', {
                  key: item[0],
                  type: 'button',
                  className: 'asc-filterChip' + (active ? ' asc-filterChip--active' : ''),
                  onClick: function () { setEventFilter(item[0]); setEventPage(0) },
                  'aria-pressed': active ? 'true' : 'false',
                  'aria-label': '筛选事件：' + item[1],
                }, item[1])
              }),
            ]),
            eventRows.length > 0
              ? h('div', { className: 'asc-rows', key: 'rows' }, eventRows)
              : h('div', { className: 'asc-hint', key: 'empty' }, '该筛选下没有事件'),
            newestFirst.length > 0
              ? h('div', { className: 'asc-pager', key: 'pager' }, [
                h('span', { className: 'asc-hint', key: 'info' },
                  '第 ' + (pageStart + 1) + '–' + (pageStart + pageEvents.length) + ' 条，共 ' + newestFirst.length + ' 条'
                  + (eventFilter === 'all' ? '' : '（已筛选）')),
                h('div', { className: 'asc-actions', key: 'btns' }, [
                  h('button', {
                    key: 'prev', type: 'button', className: 'asc-btn',
                    onClick: function () { setEventPage(Math.max(0, safePage - 1)) },
                    disabled: safePage === 0,
                    'aria-label': '上一页事件',
                  }, '上一页'),
                  h('span', { className: 'asc-hint', key: 'p' }, '第 ' + (safePage + 1) + ' / ' + pageCount + ' 页'),
                  h('button', {
                    key: 'next', type: 'button', className: 'asc-btn',
                    onClick: function () { setEventPage(Math.min(pageCount - 1, safePage + 1)) },
                    disabled: safePage >= pageCount - 1,
                    'aria-label': '下一页事件',
                  }, '下一页'),
                ]),
              ])
              : null,
          ]),
        ])
      }

      if (screen === 'repos') {
        var repoFormBox = repoForm.open
          ? h('form', {
            className: 'asc-form',
            key: 'repoForm',
            onSubmit: function (event) {
              event.preventDefault()
              var value = repoForm.value.trim()
              if (value === '') return
              var payload = { op: 'repo.add' }
              if (repoForm.mode === 'local') payload.path = value
              else payload.remoteUrl = value
              if (repoForm.name.trim()) payload.name = repoForm.name.trim()
              if (repoForm.mode === 'remote' && repoForm.credentialId) payload.credentialId = repoForm.credentialId
              run('addRepo', async function () {
                await apiAction(payload)
                setRepoForm({ open: false, mode: repoForm.mode, value: '', name: '', credentialId: '' })
              })
            },
          }, [
            h('div', { className: 'asc-row', key: 'mode' }, [
              h('label', { className: 'asc-choice', key: 'l1' }, [
                h('input', {
                  type: 'radio', name: 'asc-repo-mode', checked: repoForm.mode === 'local',
                  onChange: function () { setRepoForm({ open: true, mode: 'local', value: '', name: repoForm.name }) },
                }),
                '本地仓库路径',
              ]),
              h('label', { className: 'asc-choice', key: 'l2' }, [
                h('input', {
                  type: 'radio', name: 'asc-repo-mode', checked: repoForm.mode === 'remote',
                  onChange: function () { setRepoForm({ open: true, mode: 'remote', value: '', name: repoForm.name }) },
                }),
                '远程仓库地址',
              ]),
            ]),
            h('div', { className: 'asc-field', key: 'v' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-repo-value', key: 'l' },
                repoForm.mode === 'local' ? '本地路径（绝对路径）' : '远程地址（https / ssh / git）'),
              h('input', {
                key: 'i', id: 'asc-repo-value', className: 'asc-input', type: 'text', value: repoForm.value,
                spellCheck: 'false', autoComplete: 'off',
                placeholder: repoForm.mode === 'local' ? '/Users/me/code/Ascoder' : 'git@github.com:org/repo.git',
                onChange: function (event) { setRepoForm({ open: true, mode: repoForm.mode, value: event.target.value, name: repoForm.name }) },
              }),
            ]),
            repoForm.mode === 'remote'
              ? h('div', { className: 'asc-field', key: 'cred' }, [
                h('label', { className: 'asc-label', htmlFor: 'asc-repo-cred', key: 'l' }, '仓库凭证（私有仓库必填）'),
                h('select', {
                  key: 'i', id: 'asc-repo-cred', className: 'asc-input asc-select--full',
                  value: repoForm.credentialId,
                  onChange: function (event) {
                    setRepoForm({ open: true, mode: repoForm.mode, value: repoForm.value, name: repoForm.name, credentialId: event.target.value })
                  },
                }, [
                  h('option', { key: '', value: '' }, '— 公开仓库，无需凭证 —'),
                  credentials.map(function (credential) {
                    return h('option', { key: credential.id, value: credential.id }, credential.name + '（' + credential.username + '）')
                  }),
                ]),
                credentials.length === 0
                  ? h('span', { className: 'asc-hint', key: 'h' }, '还没有凭证：到设置 → 仓库凭证里新建。')
                  : null,
              ])
              : null,
            h('div', { className: 'asc-field', key: 'n' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-repo-name', key: 'l' }, '显示名（可选）'),
              h('input', {
                key: 'i', id: 'asc-repo-name', className: 'asc-input', type: 'text', value: repoForm.name,
                autoComplete: 'off', placeholder: '默认取仓库目录名',
                onChange: function (event) { setRepoForm({ open: true, mode: repoForm.mode, value: repoForm.value, name: event.target.value }) },
              }),
            ]),
            h('div', { className: 'asc-row', key: 'a' }, [
              h('button', { key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary', disabled: busy !== '' || repoForm.value.trim() === '' },
                busy === 'addRepo' ? '登记中…' : '登记仓库'),
              h('span', { className: 'asc-hint', key: 'h' }, '同一路径重复登记会复用已有记录。'),
            ]),
          ])
          : null

        /** 导入面板：从 Bitbucket / GitHub 拉列表后批量登记。 */
        function importField(label, htmlFor, children) {
          return h('div', { className: 'asc-field', key: htmlFor }, [
            h('label', { className: 'asc-label', htmlFor: htmlFor, key: 'l' }, label),
            children,
          ])
        }

        function runImport(key, action, after) {
          if (importState.busy !== '') return
          setImport(Object.assign({}, importState, { busy: key, error: '' }))
          ;(async function () {
            try {
              var patch = await action()
              setImport(Object.assign({}, importState, { busy: '' }, patch || {}))
              if (after) after()
            } catch (failure) {
              setImport(Object.assign({}, importState, { busy: '', error: failure.message }))
            }
          })()
        }

        var importPanel = importState.open
          ? h('div', { className: 'asc-form', key: 'importPanel' }, [
            h('div', { className: 'asc-row', key: 'p' }, [
              importField('平台', 'asc-import-provider', h('select', {
                key: 'i', id: 'asc-import-provider', className: 'asc-input asc-select--full',
                value: importState.provider,
                onChange: function (event) {
                  var provider = event.target.value
                  setImport(Object.assign({}, importState, {
                    provider: provider,
                    baseUrl: provider === 'bitbucket' ? 'https://bitbucket.example.com' : 'https://api.github.com',
                    projects: [], repos: [], selected: {}, projectKey: '', org: '', error: '',
                  }))
                },
              }, [
                h('option', { key: 'bb', value: 'bitbucket' }, 'Bitbucket Server（如 bitbucket.example.com）'),
                h('option', { key: 'gh', value: 'github' }, 'GitHub / GitHub 企业版'),
              ])),
              importField('凭证', 'asc-import-cred', h('select', {
                key: 'i', id: 'asc-import-cred', className: 'asc-input asc-select--full',
                value: importState.credentialId,
                onChange: function (event) { setImport(Object.assign({}, importState, { credentialId: event.target.value })) },
              }, [
                h('option', { key: '', value: '' }, '— 选择凭证 —'),
                credentials.map(function (credential) {
                  return h('option', { key: credential.id, value: credential.id }, credential.name + '（' + credential.username + '）')
                }),
              ])),
            ]),
            h('div', { className: 'asc-row', key: 'u' }, [
              importField('服务器地址', 'asc-import-base', h('input', {
                key: 'i', id: 'asc-import-base', className: 'asc-input', type: 'text', value: importState.baseUrl,
                placeholder: importState.provider === 'bitbucket' ? 'https://bitbucket.example.com' : 'https://github.com',
                autoComplete: 'off',
                onChange: function (event) { setImport(Object.assign({}, importState, { baseUrl: event.target.value })) },
              })),
              importState.provider === 'github'
                ? importField('组织（可选）', 'asc-import-org', h('input', {
                  key: 'i', id: 'asc-import-org', className: 'asc-input', type: 'text', value: importState.org,
                  placeholder: '留空则列出你有权限的仓库', autoComplete: 'off',
                  onChange: function (event) { setImport(Object.assign({}, importState, { org: event.target.value })) },
                }))
                : null,
            ]),
            importState.provider === 'bitbucket'
              ? h('div', { className: 'asc-row', key: 'proj' }, [
                h('button', {
                  key: 'load', type: 'button', className: 'asc-btn',
                  onClick: function () {
                    runImport('projects', async function () {
                      var data = await apiAction({
                        op: 'import.projects', provider: 'bitbucket',
                        baseUrl: importState.baseUrl, credentialId: importState.credentialId,
                      })
                      return { projects: (data && data.projects) || [], repos: [], selected: {} }
                    })
                  },
                  disabled: importState.busy !== '' || importState.credentialId === '',
                  'aria-label': '加载 Bitbucket 项目',
                }, importState.busy === 'projects' ? '加载中…' : '加载项目'),
                importState.projects.length > 0
                  ? importField('项目', 'asc-import-project', h('select', {
                    key: 'i', id: 'asc-import-project', className: 'asc-input asc-select--full',
                    value: importState.projectKey,
                    onChange: function (event) { setImport(Object.assign({}, importState, { projectKey: event.target.value, repos: [], selected: {} })) },
                  }, [
                    h('option', { key: '', value: '' }, '— 选择项目 —'),
                    importState.projects.map(function (project) {
                      return h('option', { key: project.key, value: project.key }, project.key + ' · ' + project.name)
                    }),
                  ]))
                  : h('span', { className: 'asc-hint', key: 'h' }, '先加载项目列表（需要有效的凭证）'),
                h('button', {
                  key: 'repos', type: 'button', className: 'asc-btn asc-btn--primary',
                  onClick: function () {
                    runImport('repos', async function () {
                      var data = await apiAction({
                        op: 'import.repos', provider: 'bitbucket',
                        baseUrl: importState.baseUrl, credentialId: importState.credentialId,
                        projectKey: importState.projectKey,
                      })
                      return { repos: (data && data.repos) || [], selected: {} }
                    })
                  },
                  disabled: importState.busy !== '' || importState.credentialId === '' || importState.projectKey === '',
                  'aria-label': '加载项目下的仓库',
                }, importState.busy === 'repos' ? '加载中…' : '加载仓库'),
              ])
              : h('div', { className: 'asc-row', key: 'proj' }, [
                h('button', {
                  key: 'repos', type: 'button', className: 'asc-btn asc-btn--primary',
                  onClick: function () {
                    runImport('repos', async function () {
                      var data = await apiAction({
                        op: 'import.repos', provider: 'github',
                        baseUrl: importState.baseUrl, credentialId: importState.credentialId,
                        org: importState.org,
                      })
                      return { repos: (data && data.repos) || [], selected: {} }
                    })
                  },
                  disabled: importState.busy !== '' || importState.credentialId === '',
                  'aria-label': '加载 GitHub 仓库',
                }, importState.busy === 'repos' ? '加载中…' : '加载仓库'),
                h('span', { className: 'asc-hint', key: 'h' }, '用凭证读取你有权限的仓库，公开仓库也可用只读令牌'),
              ]),
            importState.error ? h('div', { className: 'asc-error', role: 'alert', key: 'err' }, [h('span', { key: 'm' }, importState.error)]) : null,
            importState.noticeText ? h('div', { className: 'asc-ok', role: 'status', key: 'ok' }, [h('span', { key: 'm' }, importState.noticeText)]) : null,
            importState.repos.length > 0
              ? h('div', { key: 'list' }, [
                h('div', { className: 'asc-row', key: 'head' }, [
                  h('button', {
                    key: 'all', type: 'button', className: 'asc-btn',
                    onClick: function () {
                      var selected = {}
                      var allOn = importState.repos.every(function (repo) { return importState.selected[repo.remoteUrl] })
                      if (!allOn) importState.repos.forEach(function (repo) { selected[repo.remoteUrl] = true })
                      setImport(Object.assign({}, importState, { selected: selected }))
                    },
                    'aria-label': '全选仓库',
                  }, Object.keys(importState.selected).length === importState.repos.length ? '全不选' : '全选'),
                  h('span', { className: 'asc-hint', key: 'n' },
                    Object.keys(importState.selected).length + ' / ' + importState.repos.length + ' 个待导入'),
                ]),
                h('div', { className: 'asc-roleList', key: 'rows', style: { maxHeight: '260px', overflow: 'auto' } },
                  importState.repos.map(function (repo) {
                    var checked = !!importState.selected[repo.remoteUrl]
                    return h('label', { className: 'asc-roleRow', key: repo.remoteUrl, style: { display: 'block', padding: '10px 12px', cursor: 'pointer' } }, [
                      h('span', { className: 'asc-row', key: 'r', style: { gap: '8px' } }, [
                        h('input', {
                          key: 'c', type: 'checkbox', checked: checked,
                          onChange: function () {
                            var selected = Object.assign({}, importState.selected)
                            if (checked) delete selected[repo.remoteUrl]
                            else selected[repo.remoteUrl] = true
                            setImport(Object.assign({}, importState, { selected: selected }))
                          },
                        }),
                        h('span', { key: 'n' }, [
                          h('span', { className: 'asc-name', key: 'name' }, repo.name),
                          h('span', { className: 'asc-path', key: 'url' }, repo.remoteUrl),
                        ]),
                      ]),
                    ])
                  })),
                h('div', { className: 'asc-row', key: 'submit' }, [
                  h('button', {
                    key: 'go', type: 'button', className: 'asc-btn asc-btn--primary',
                    onClick: function () {
                      var picked = importState.repos.filter(function (repo) { return importState.selected[repo.remoteUrl] })
                      runImport('add', async function () {
                        var data = await apiAction({
                          op: 'import.add', provider: importState.provider,
                          baseUrl: importState.baseUrl, credentialId: importState.credentialId,
                          ...(importState.provider === 'bitbucket' ? { projectKey: importState.projectKey } : { org: importState.org }),
                          repos: picked.map(function (repo) { return { name: repo.name, remoteUrl: repo.remoteUrl } }),
                        })
                        return { repos: [], selected: {}, projects: importState.projects, error: '' , noticeText: '已导入 ' + (data.added || 0) + ' 个仓库' + (data.skipped ? '，跳过重复 ' + data.skipped + ' 个' : '') }
                      })
                    },
                    disabled: importState.busy !== '' || Object.keys(importState.selected).length === 0,
                    'aria-label': '导入选中的仓库',
                  }, importState.busy === 'add' ? '导入中…' : '导入选中（' + Object.keys(importState.selected).length + '）'),
                  h('span', { className: 'asc-hint', key: 'h' }, '导入后自动绑定当前凭证，可在项目里挑选使用'),
                ]),
              ])
              : null,
          ])
          : null

        var repoRows = repositories.map(function (repository) {
          return h('div', { className: 'asc-spaceRow', key: repository.id }, [
            h('div', { className: 'asc-spaceMain', key: 'm' }, [
              h('div', { className: 'asc-spaceName', key: 'n' }, [
                h('span', { className: 'asc-name', key: 't' }, repository.name),
                repository.defaultBranch ? h('span', { className: 'asc-pill', key: 'b' }, repository.defaultBranch) : null,
              ]),
              h('div', { className: 'asc-path', key: 'p', title: repository.path || repository.remoteUrl || '' },
                repository.path || repository.remoteUrl || ''),
              h('div', { className: 'asc-meta', key: 'meta' }, [
                h('span', { key: 's' }, repository.lastSyncAt ? '最近同步 ' + shortTime(repository.lastSyncAt) : '未同步'),
                repository.credentialId
                  ? h('span', { key: 'c', className: 'asc-pill' }, '凭证：' + ((credentials.find(function (item) { return item.id === repository.credentialId }) || {}).name || '已删除'))
                  : h('span', { key: 'c', className: 'asc-hint' }, '公开仓库'),
              ]),
            ]),
            h('div', { className: 'asc-spaceActions', key: 'a' }, [
              repository.path
                ? h('button', {
                  key: 'sync', type: 'button', className: 'asc-iconBtn',
                  onClick: function () { run('syncRepo', function () { return apiAction({ op: 'repo.sync', repositoryId: repository.id }) }) },
                  disabled: busy !== '',
                  title: '同步仓库（git fetch）',
                  'aria-label': '同步仓库 ' + repository.name,
                }, [ascIcon('refresh')])
                : null,
              h('button', {
                key: 'rm', type: 'button', className: 'asc-iconBtn asc-iconBtn--danger',
                onClick: function () {
                  if (typeof window !== 'undefined' && typeof window.confirm === 'function'
                    && !window.confirm('删除仓库「' + repository.name + '」？仍被项目使用的仓库不能删除。')) return
                  run('removeRepo', function () { return apiAction({ op: 'repo.remove', repositoryId: repository.id }) })
                },
                disabled: busy !== '',
                title: '删除仓库',
                'aria-label': '删除仓库 ' + repository.name,
              }, [ascIcon('trash')]),
            ]),
          ])
        })

        body = h('div', { className: 'asc-list', key: 'repos' }, [
          h('div', { className: 'asc-row', key: 'top' }, [
            h('button', {
              key: 'add', type: 'button', className: 'asc-btn asc-btn--primary',
              onClick: function () { setRepoForm({ open: !repoForm.open, mode: repoForm.mode, value: repoForm.value, name: repoForm.name }) },
              'aria-expanded': repoForm.open ? 'true' : 'false',
              'aria-label': repoForm.open ? '收起登记表单' : '登记仓库',
            }, repoForm.open
              ? [ascIcon('close'), h('span', { key: 't' }, '取消')]
              : [ascIcon('plus'), h('span', { key: 't' }, '登记仓库')]),
            h('button', {
              key: 'import', type: 'button', className: 'asc-btn',
              onClick: function () { setImport(Object.assign({}, importState, { open: !importState.open, error: '' })) },
              'aria-expanded': importState.open ? 'true' : 'false',
              'aria-label': importState.open ? '收起导入面板' : '导入仓库',
            }, importState.open
              ? [ascIcon('close'), h('span', { key: 't' }, '取消导入')]
              : [ascIcon('download'), h('span', { key: 't' }, '导入仓库')]),
            h('span', { className: 'asc-hint', key: 'h' }, repositories.length + ' 个仓库'),
          ]),
          repoFormBox,
          importPanel,
          repoRows.length === 0
            ? h('div', { className: 'asc-empty', key: 'empty' }, [
              h('div', { className: 'asc-name', key: 'a' }, '还没有登记仓库'),
              h('div', { key: 'b' }, '登记本地或远程仓库后，就能在项目里挑选它们作为成员。'),
            ])
            : h('div', { className: 'asc-rows', key: 'rows' }, repoRows),
        ])
      }

      if (screen === 'spaceBranches' && project && spaceBranch.space) {
        var editingSpace = spaceBranch.space
        var branchRows = spaceBranch.members.map(function (member) {
          var options = spaceBranch.candidates[member.alias] || []
          var value = spaceBranch.picks[member.alias] || editingSpace.branch
          var lacksWanted = options.length > 0 && options.indexOf(editingSpace.branch) === -1
          return h('div', { className: 'asc-spaceRow', key: member.alias, role: 'group', 'aria-label': '成员 ' + member.alias }, [
            h('div', { className: 'asc-spaceMain', key: 'm' }, [
              h('div', { className: 'asc-spaceName', key: 'n' }, [
                h('span', { className: 'asc-branchName', key: 'b' }, member.alias),
                lacksWanted ? h('span', { key: 'w', className: 'asc-pill' }, '无空间分支') : null,
                member.head ? h('span', { key: 'h', className: 'asc-hint' }, 'HEAD ' + String(member.head).slice(0, 7)) : null,
              ]),
              h('div', { className: 'asc-meta', key: 'd' }, [
                h('span', { key: 'c' }, member.error ? String(member.error) : (member.branch || '未物化')),
              ]),
            ]),
            h('div', { className: 'asc-spaceActions', key: 'a' }, [
              h('select', {
                key: 's',
                className: 'asc-input asc-branchSelect',
                value: value,
                'aria-label': '选择 ' + member.alias + ' 的分支',
                onChange: function (event) {
                  var target = event.target.value
                  setSpaceBranch(function (previous) {
                    var next = Object.assign({}, previous.picks)
                    next[member.alias] = target
                    return Object.assign({}, previous, { picks: next })
                  })
                },
              }, options.map(function (name) {
                return h('option', { key: name, value: name }, name === editingSpace.branch ? name + '（空间分支）' : name)
              })),
            ]),
          ])
        })
        body = h('div', { className: 'asc-list', key: 'spaceBranches' }, [
          h('div', { className: 'asc-hint', key: 'tip' },
            '空间分支：' + editingSpace.branch + '。成员没有该分支时（标「无空间分支」），从下拉里挑它实际在用的分支，保存后会重新准备。'),
          spaceBranch.error ? h('div', { className: 'asc-hint asc-hint--error', key: 'e' }, spaceBranch.error) : null,
          spaceBranch.notice ? h('div', { className: 'asc-hint', key: 'n' }, spaceBranch.notice) : null,
          spaceBranch.status === 'loading'
            ? h('div', { className: 'asc-hint', key: 'l' }, '读取成员与候选分支…')
            : h('div', { className: 'asc-rows', key: 'rows' }, branchRows),
          h('div', { className: 'asc-actions', key: 'act' }, [
            h('button', {
              key: 'save', type: 'button', className: 'asc-btn asc-btn--primary',
              onClick: function () { saveSpaceBranches(project, editingSpace) },
              disabled: busy !== '' || spaceBranch.status !== 'ready',
              'aria-label': '保存分支映射并重新准备',
            }, busy === 'saveSpaceBranches'
              ? [h(AscoderBird, { key: 'b', size: 15, live: true }), h('span', { key: 't' }, '准备中…')]
              : [ascIcon('check'), h('span', { key: 't' }, '保存并重新准备')]),
            h('button', {
              key: 'back', type: 'button', className: 'asc-btn',
              onClick: function () { setScreen('spaces') },
            }, [ascIcon('back'), h('span', { key: 't' }, '返回')]),
          ]),
        ])
      }

      if (screen === 'settings' && project) {
        var memberRows = project.members.map(function (member) {
          return h('div', { className: 'asc-member', key: member.id }, [
            h('div', { className: 'asc-memberMain', key: 'm' }, [
              h('div', { className: 'asc-name', key: 'n' }, member.alias),
              h('div', { className: 'asc-path', key: 'p', title: (member.repository && (member.repository.path || member.repository.remoteUrl)) || '' },
                member.repository
                  ? (member.repository.path || member.repository.remoteUrl || member.repository.name)
                  : '(仓库已删除)'),
            ]),
            h('div', { className: 'asc-memberSide', key: 's' }, [
              member.repository && member.repository.path
                ? h('button', {
                  key: 'sync', type: 'button', className: 'asc-iconBtn',
                  onClick: function () { run('syncMember', function () { return apiAction({ op: 'member.sync', projectId: project.id, memberId: member.id }) }) },
                  disabled: busy !== '',
                  title: '同步该成员的仓库（git fetch）',
                  'aria-label': '同步 ' + member.alias,
                }, [ascIcon('refresh')])
                : null,
              h('button', {
                key: 'rm', type: 'button', className: 'asc-iconBtn asc-iconBtn--danger',
                onClick: function () { run('removeMember', function () { return apiAction({ op: 'member.remove', projectId: project.id, memberId: member.id }) }) },
                disabled: busy !== '',
                title: '从项目中移除该仓库成员',
                'aria-label': '移除成员 ' + member.alias,
              }, [ascIcon('trash')]),
            ]),
          ])
        })

        var memberForm = memberOpen
          ? h('form', {
            className: 'asc-form',
            key: 'member',
            onSubmit: function (event) {
              event.preventDefault()
              if (memberDraft.repositoryId === '') return
              run('addMember', async function () {
                await apiAction({
                  op: 'member.add',
                  projectId: project.id,
                  repositoryId: memberDraft.repositoryId,
                  ...(memberDraft.alias.trim() ? { alias: memberDraft.alias.trim() } : {}),
                })
                setMemberOpen(false)
                setMemberDraft({ repositoryId: '', alias: '' })
              })
            },
          }, [
            repositories.length === 0
              ? h('div', { className: 'asc-empty', key: 'empty' }, [
                h('div', { key: 'a' }, '还没有登记仓库'),
                h('div', { key: 'b' }, '先到「仓库管理」登记仓库，再回到这里挑选。'),
                h('button', {
                  key: 'c', type: 'button', className: 'asc-btn asc-btn--primary',
                  onClick: function () { setScreen('repos') }, 'aria-label': '去登记仓库',
                }, '去登记仓库'),
              ])
              : h('div', { className: 'asc-row', key: 'pick' }, [
                h('div', { className: 'asc-field', key: 'r' }, [
                  h('label', { className: 'asc-label', htmlFor: 'asc-member-repo', key: 'l' }, '选择仓库'),
                  h('select', {
                    key: 'i', id: 'asc-member-repo', className: 'asc-input asc-select--full',
                    value: memberDraft.repositoryId,
                    onChange: function (event) { setMemberDraft({ repositoryId: event.target.value, alias: memberDraft.alias }) },
                  }, [
                    h('option', { key: '', value: '' }, '— 选择已登记仓库 —'),
                    repositories.map(function (repository) {
                      return h('option', { key: repository.id, value: repository.id }, repository.name)
                    }),
                  ]),
                ]),
                h('div', { className: 'asc-field', key: 'a' }, [
                  h('label', { className: 'asc-label', htmlFor: 'asc-member-alias', key: 'l' }, '目录别名（可选）'),
                  h('input', {
                    key: 'i', id: 'asc-member-alias', className: 'asc-input', type: 'text', value: memberDraft.alias,
                    autoComplete: 'off', placeholder: '默认取仓库名',
                    onChange: function (event) { setMemberDraft({ repositoryId: memberDraft.repositoryId, alias: event.target.value }) },
                  }),
                ]),
              ]),
            h('div', { className: 'asc-row', key: 'submit' }, [
              h('button', {
                key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary',
                disabled: busy !== '' || memberDraft.repositoryId === '',
              }, busy === 'addMember' ? '添加中…' : '加入项目'),
              h('span', { className: 'asc-hint', key: 'h' }, '分支空间会按成员列表逐个物化仓库。'),
            ]),
          ])
          : null

        body = h('div', { className: 'asc-list', key: 'settings' }, [
          h('section', { className: 'asc-section', key: 'info' }, [
            h('h3', { className: 'asc-sectionTitle', key: 't' }, '基本信息'),
            h('div', { className: 'asc-row', key: 'r' }, [
              h('div', { className: 'asc-field', key: 'n' }, [
                h('label', { className: 'asc-label', htmlFor: 'asc-edit-name', key: 'l' }, '项目名称'),
                h('input', {
                  key: 'i', id: 'asc-edit-name', className: 'asc-input', type: 'text', value: edit.name,
                  onChange: function (event) { setEdit({ name: event.target.value, description: edit.description }) },
                }),
              ]),
              h('div', { className: 'asc-field', key: 'd' }, [
                h('label', { className: 'asc-label', htmlFor: 'asc-edit-desc', key: 'l' }, '描述'),
                h('input', {
                  key: 'i', id: 'asc-edit-desc', className: 'asc-input', type: 'text', value: edit.description,
                  onChange: function (event) { setEdit({ name: edit.name, description: event.target.value }) },
                }),
              ]),
            ]),
            h('div', { className: 'asc-row', key: 'a' }, [
              h('button', {
                key: 'save', type: 'button', className: 'asc-btn',
                onClick: function () {
                  run('saveProject', function () {
                    return apiAction({ op: 'project.update', projectId: project.id, name: edit.name.trim(), description: edit.description.trim() })
                  })
                },
                disabled: busy !== '' || edit.name.trim() === '',
                'aria-label': '保存项目信息',
              }, busy === 'saveProject'
                ? [h(AscoderBird, { key: 'b', size: 15, live: true }), h('span', { key: 't' }, '保存中…')]
                : [ascIcon('check'), h('span', { key: 't' }, '保存')]),
            ]),
          ]),
          h('section', { className: 'asc-section', key: 'members' }, [
            h('div', { className: 'asc-sectionHead', key: 'h' }, [
              h('h3', { className: 'asc-sectionTitle', key: 't' }, '仓库成员（' + project.memberCount + '）'),
              h('button', {
                key: 'add', type: 'button', className: 'asc-btn',
                onClick: function () { setMemberOpen(!memberOpen) },
                'aria-expanded': memberOpen ? 'true' : 'false',
                'aria-label': memberOpen ? '收起添加仓库' : '添加仓库',
              }, memberOpen
                ? [ascIcon('close'), h('span', { key: 't' }, '取消')]
                : [ascIcon('plus'), h('span', { key: 't' }, '添加仓库')]),
            ]),
            memberForm,
            memberRows.length > 0
              ? h('div', { className: 'asc-members', key: 'rows' }, memberRows)
              : h('div', { className: 'asc-empty', key: 'empty' }, [
                h('div', { key: 'b' }, '还没有仓库成员。添加至少一个仓库后，才能新建分支空间。'),
              ]),
          ]),
          h('section', { className: 'asc-section asc-section--danger', key: 'danger' }, [
            h('h3', { className: 'asc-sectionTitle', key: 't' }, '删除项目'),
            h('div', { className: 'asc-row', key: 'r' }, [
              h('span', { className: 'asc-hint', key: 'h' }, '会连同全部分支空间目录一起删除，成员仓库本体不受影响。'),
              h('button', {
                key: 'rm', type: 'button', className: 'asc-btn asc-btn--danger',
                onClick: function () {
                  if (typeof window !== 'undefined' && typeof window.confirm === 'function'
                    && !window.confirm('删除项目「' + project.name + '」？')) return
                  run('deleteProject', async function () {
                    await apiAction({ op: 'project.remove', projectId: project.id })
                    goProjects()
                  })
                },
                disabled: busy !== '',
                'aria-label': '删除项目 ' + project.name,
              }, [ascIcon('trash'), h('span', { key: 't' }, '删除项目')]),
            ]),
          ]),
        ])
      }

      var noticeBox = notice
        ? h('div', { className: notice.kind === 'ok' ? 'asc-ok' : 'asc-error', role: notice.kind === 'ok' ? 'status' : 'alert', key: 'notice' }, [
          h('span', { key: 'm' }, notice.text),
          h('button', { key: 'x', type: 'button', className: 'asc-btn asc-btn--quiet', onClick: function () { setNotice(null) }, 'aria-label': '关闭提示' }, '关闭'),
        ])
        : null

      var gateBox = gate.open
        ? h('div', { className: 'asc-gate', key: 'gate', role: 'dialog', 'aria-modal': 'true', 'aria-label': '设置密码' }, [
          h('form', {
            className: 'asc-gateCard',
            key: 'c',
            onSubmit: function (event) {
              event.preventDefault()
              if (gate.busy || gate.password === '') return
              setGate({ open: true, password: gate.password, error: '', busy: true })
              ;(async function () {
                try {
                  var data = await apiAction({ op: 'auth.verify', password: gate.password })
                  if (!data || data.valid !== true) {
                    setGate({ open: true, password: '', error: '密码不正确', busy: false })
                    return
                  }
                  settingsUnlocked = true
                  setGate({ open: false, password: '', error: '', busy: false })
                  setGate({ open: false, password: '', error: '', busy: false })
                  setTimeout(openHostSettings, 100)
                } catch (failure) {
                  setGate({ open: true, password: '', error: failure.message, busy: false })
                }
              })()
            },
          }, [
            h('div', { className: 'asc-gateTitle', key: 't' }, '输入设置密码'),
            h('label', { className: 'asc-sr', htmlFor: 'asc-gate-input', key: 'l' }, '设置密码'),
            h('input', {
              key: 'i', id: 'asc-gate-input', className: 'asc-input', type: 'password', value: gate.password,
              autoFocus: true, autoComplete: 'current-password',
              onChange: function (event) { setGate({ open: true, password: event.target.value, error: '', busy: false }) },
            }),
            gate.error ? h('div', { className: 'asc-error', role: 'alert', key: 'e' }, [h('span', { key: 'm' }, gate.error)]) : null,
            h('div', { className: 'asc-actions', key: 'a' }, [
              h('button', {
                key: 'cancel', type: 'button', className: 'asc-btn',
                onClick: function () { setGate({ open: false, password: '', error: '', busy: false }) },
                'aria-label': '取消进入设置',
              }, '取消'),
              h('button', { key: 'ok', type: 'submit', className: 'asc-btn asc-btn--primary', disabled: gate.busy || gate.password === '' },
                gate.busy ? '校验中…' : '进入设置'),
            ]),
          ]),
        ])
        : null

      if (!open) return null

      return h('div', {
        className: 'asc-home',
        key: 'home',
        onKeyDown: function (event) {
          if (event.key !== 'Escape') return
          if (gate.open) {
            setGate({ open: false, password: '', error: '', busy: false })
            return
          }
          if (screen !== 'projects') {
            if (screen === 'settings' || screen === 'newSpace') {
              if (project) { setProjectId(project.id); setScreen('spaces') }
              return
            }
            goProjects()
            return
          }
          setOpen(false)
        },
      }, [
        h('div', { className: 'asc-homeInner', key: 'inner' }, [
          h(PageHeader, {
            key: 'h',
            label: screen === 'projects' || heading[0] === 'Ascoder' ? '' : heading[0],
            version: view.data && view.data.version ? String(view.data.version) : '',
            actions: headerActions,
          }),
          noticeBox,
          view.status === 'error'
            ? h('div', { className: 'asc-error', role: 'alert', key: 'loaderr' }, [
              h('span', { key: 'm' }, view.error || '加载失败'),
              h('button', { key: 'r', type: 'button', className: 'asc-btn', onClick: load, 'aria-label': '重试加载' }, '重试'),
            ])
            : null,
          body,
        ]),
        gateBox,
      ])
    }

    /** 允许出现在侧栏的分组标题（Ascoder 空间）；null 表示尚未加载。 */
    var allowedGroupTitles = null

    /** 拉取 Ascoder 空间分组标题，供侧栏过滤使用。 */
    function refreshAllowedTitles() {
      if (typeof document === 'undefined') return
      apiGet('/api/ascoder/state').then(function (data) {
        var titles = (data && data.spaces) || []
        var next = {}
        for (var index = 0; index < titles.length; index += 1) next[titles[index]] = true
        allowedGroupTitles = next
        // 已删除/不存在的分支不再作为"当前分支"记忆
        if (rememberedSpaceTitle && next[rememberedSpaceTitle] !== true) {
          rememberedSpaceTitle = null
          try { window.localStorage.removeItem(SPACE_TITLE_KEY) } catch (error) { /* 忽略 */ }
        }
        hideForeignGroups()
      }).catch(function () {
        // 未登录或接口暂不可用时保持现状
      })
    }

    /** 读取节点的标题文本（隐藏元素也能读到，innerText 读不到）。 */
    function rowTitle(element) {
      if (!element) return ''
      return (element.textContent || '').replace(/\s+/g, ' ').trim()
    }

    /** 找到一棵树里承载某个行的工作区分组包裹层。 */
    function groupWrapperOf(tree, element) {
      if (!tree || !element) return null
      var node = element
      while (node && node.parentElement !== tree) node = node.parentElement
      return node && node.parentElement === tree ? node : null
    }

    /** 读取当前选中会话的 row key（用于判断是否换了会话）。 */
    function selectedSessionKey() {
      if (typeof document === 'undefined') return ''
      var node = document.querySelector('[role="treeitem"][data-row-key^="session:"][aria-selected="true"]')
      return node ? node.getAttribute('data-row-key') || '' : ''
    }

    /** 读取当前选中会话所属的分组标题。 */
    function activeSidebarGroupTitle() {
      if (typeof document === 'undefined') return null
      var tree = document.querySelector('[role="tree"]')
      if (!tree) return null
      var selected = tree.querySelector('[role="treeitem"][aria-selected="true"]')
      if (!selected) return null
      var wrapper = groupWrapperOf(tree, selected)
      if (!wrapper) return null
      var row = wrapper.querySelector('[role="treeitem"][data-row-key^="workspace:"]')
      return row ? rowTitle(row) : null
    }

    /** 应用/撤销一个分组包裹层的隐藏状态。 */
    function applyHiddenRow(element, hide) {
      if (!element) return
      if (hide) {
        if (element.dataset.ascoderHiddenGroup === 'true') return
        element.style.display = 'none'
        element.dataset.ascoderHiddenGroup = 'true'
      } else if (element.dataset.ascoderHiddenGroup === 'true') {
        element.style.display = ''
        delete element.dataset.ascoderHiddenGroup
      }
    }

    /**
     * 当前分支标题：优先用最近一次会话所属分支，其次用持久化记忆；
     * 两者都必须匹配真实分支空间，否则退化为"第一个真实分支"，保证侧栏不为空。
     */
    function activeBranchTitle() {
      if (!allowedGroupTitles) return null
      var candidate = currentBranchTitle || rememberedSpaceTitle
      if (candidate && allowedGroupTitles[candidate] === true) return candidate
      for (var key in allowedGroupTitles) {
        if (allowedGroupTitles[key] === true) return key
      }
      return null
    }

    /**
     * 侧栏收敛：一个分支空间只显示当前分支的会话。
     *
     * 宿主的每个 workspace 是一个包裹层（组标题 + 会话行 + 「展开其余 N 个会话」），
     * 非当前分支必须整层隐藏，否则残留的会话行/展开计数会看起来挂在当前分支下面。
     * 当前分支的包裹层则强制展开（分支会话不允许收起）。
     */
    function hideForeignGroups() {
      if (!allowedGroupTitles || typeof document === 'undefined') return
      var tree = document.querySelector('[role="tree"]')
      if (!tree) return
      var active = activeBranchTitle()
      var children = Array.from(tree.children)
      for (var i = 0; i < children.length; i += 1) {
        var wrapper = children[i]
        var row = wrapper.querySelector('[role="treeitem"][data-row-key^="workspace:"]')
        if (!row) continue
        var title = rowTitle(row)
        if (title === '') continue
        var isBranch = allowedGroupTitles[title] === true
        var hide = !isBranch
        if (isBranch && active && title !== active) hide = true
        applyHiddenRow(wrapper, hide)
      }
    }

    /** 当前分支分组强制展开：用户点击收起后立即恢复。 */
    function enforceBranchGroupsExpanded() {
      if (!allowedGroupTitles || typeof document === 'undefined') return
      var active = activeBranchTitle()
      if (!active) return
      var rows = document.querySelectorAll('[role="treeitem"][data-row-key^="workspace:"]')
      for (var i = 0; i < rows.length; i += 1) {
        var row = rows[i]
        if (rowTitle(row) !== active) continue
        if (row.getAttribute('aria-expanded') !== 'false') return
        var now = Date.now()
        var last = Number(row.getAttribute('data-ascoder-expand-at') || '0')
        if (now - last < 500) return
        row.setAttribute('data-ascoder-expand-at', String(now))
        row.click()
        return
      }
    }

    /** 安装侧栏过滤：定时 + DOM 变化时重新收敛。 */
    function installSidebarFilter() {
      if (typeof document === 'undefined') return
      if (window.__ascoderSidebarFilter === true) return
      window.__ascoderSidebarFilter = true
      refreshAllowedTitles()
      setInterval(refreshAllowedTitles, 5000)
      setInterval(function () {
        try {
          hideForeignGroups()
          enforceBranchGroupsExpanded()
        } catch (error) { /* 单次失败不影响下一轮 */ }
      }, 400)
      // 选中会话 / 分组展开收起时立即收敛
      var tree = null
      var observer = null
      var attach = function () {
        var next = document.querySelector('[role="tree"]')
        if (!next || next === tree) return
        tree = next
        if (observer) observer.disconnect()
        if (typeof MutationObserver !== 'function') return
        observer = new MutationObserver(function () {
          try {
            hideForeignGroups()
            enforceBranchGroupsExpanded()
          } catch (error) { /* 忽略单次失败 */ }
        })
        observer.observe(tree, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['aria-selected', 'aria-expanded', 'data-row-key'],
        })
      }
      attach()
      setInterval(attach, 2000)
    }

    /** 仓库凭证：远程仓库用的用户名 + 令牌，令牌只回显掩码。 */
    function AscoderCredentialSection() {
      var dataHook = React.useState({ status: 'loading', credentials: [], usage: {} })
      var data = dataHook[0]
      var setData = dataHook[1]

      var formHook = React.useState({ open: false, editingId: '', name: '', username: '', secret: '' })
      var form = formHook[0]
      var setForm = formHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/state')
          .then(function (payload) {
            var usage = {}
            var repositories = (payload && payload.repositories) || []
            for (var i = 0; i < repositories.length; i += 1) {
              var id = repositories[i].credentialId
              if (!id) continue
              usage[id] = (usage[id] || 0) + 1
            }
            setData({ status: 'ready', credentials: (payload && payload.credentials) || [], usage: usage })
          })
          .catch(function (failure) { setNotice({ kind: 'error', text: failure.message }) })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      function act(key, action, after) {
        if (busy !== '') return
        setBusy(key)
        setNotice(null)
        ;(async function () {
          try {
            await action()
            await reload()
            if (after) after()
          } catch (failure) {
            setNotice({ kind: 'error', text: failure.message })
          } finally {
            setBusy('')
          }
        })()
      }

      function submit(event) {
        event.preventDefault()
        if (form.name.trim() === '' || form.username.trim() === '') return
        if (!form.editingId && form.secret.trim() === '') return
        act('save', async function () {
          await apiAction({
            op: 'cred.add',
            ...(form.editingId ? { credentialId: form.editingId } : {}),
            name: form.name.trim(),
            username: form.username.trim(),
            ...(form.secret.trim() ? { secret: form.secret.trim() } : {}),
          })
        }, function () {
          setForm({ open: false, editingId: '', name: '', username: '', secret: '' })
        })
      }

      var rows = data.credentials.map(function (credential) {
        var used = data.usage[credential.id] || 0
        return h('div', { className: 'asc-roleRow', key: credential.id }, [
          h('div', { className: 'asc-roleHead', key: 'h' }, [
            h('div', { className: 'asc-roleText', key: 't' }, [
              h('div', { className: 'asc-spaceName', key: 'n' }, [
                h('span', { className: 'asc-name', key: 'name' }, credential.name),
                h('span', { className: 'asc-pill', key: 'u' }, used > 0 ? used + ' 个仓库使用' : '未使用'),
              ]),
              h('div', { className: 'asc-desc', key: 'd' }, credential.username + ' · ' + credential.masked),
            ]),
            h('div', { className: 'asc-memberSide', key: 'a' }, [
              h('button', {
                key: 'edit', type: 'button', className: 'asc-btn',
                onClick: function (item) {
                  return function () {
                    setForm({ open: true, editingId: item.id, name: item.name, username: item.username, secret: '' })
                  }
                }(credential),
                'aria-label': '编辑凭证 ' + credential.name,
              }, '编辑'),
              h('button', {
                key: 'rm', type: 'button', className: 'asc-btn asc-btn--danger',
                onClick: function (item) {
                  return function () {
                    if (typeof window !== 'undefined' && typeof window.confirm === 'function'
                      && !window.confirm('删除凭证「' + item.name + '」？已使用它的仓库将无法拉取私有代码。')) return
                    act('remove', function () { return apiAction({ op: 'cred.remove', credentialId: item.id }) })
                  }
                }(credential),
                disabled: busy !== '',
                'aria-label': '删除凭证 ' + credential.name,
              }, '删除'),
            ]),
          ]),
        ])
      })

      var formBox = form.open
        ? h('form', { className: 'asc-form', key: 'f', onSubmit: submit }, [
          h('div', { className: 'asc-row', key: 'top' }, [
            h('div', { className: 'asc-field', key: 'n' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-cred-name', key: 'l' }, '凭证名称'),
              h('input', {
                key: 'i', id: 'asc-cred-name', className: 'asc-input', type: 'text', value: form.name,
                placeholder: '例如：GitHub 只读令牌', autoComplete: 'off',
                onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: event.target.value, username: form.username, secret: form.secret }) },
              }),
            ]),
            h('div', { className: 'asc-field', key: 'u' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-cred-user', key: 'l' }, '用户名'),
              h('input', {
                key: 'i', id: 'asc-cred-user', className: 'asc-input', type: 'text', value: form.username,
                placeholder: 'git 用户名 / 令牌账号', autoComplete: 'off',
                onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: form.name, username: event.target.value, secret: form.secret }) },
              }),
            ]),
          ]),
          h('div', { className: 'asc-field', key: 's' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-cred-secret', key: 'l' },
              form.editingId ? '令牌 / 密码（留空表示不修改）' : '令牌 / 密码'),
            h('input', {
              key: 'i', id: 'asc-cred-secret', className: 'asc-input', type: 'password', value: form.secret,
              autoComplete: 'new-password', placeholder: '只保存加密后的密文，不回显',
              onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: form.name, username: form.username, secret: event.target.value }) },
            }),
          ]),
          h('div', { className: 'asc-row', key: 'a' }, [
            h('button', { key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary', disabled: busy !== '' }, busy === 'save' ? '保存中…' : '保存凭证'),
            h('button', {
              key: 'c', type: 'button', className: 'asc-btn',
              onClick: function () { setForm({ open: false, editingId: '', name: '', username: '', secret: '' }) },
              'aria-label': '取消编辑凭证',
            }, '取消'),
          ]),
        ])
        : null

      return h('div', { className: 'asc-panel', style: { maxWidth: '660px' } }, [
        h('div', { key: 'h' }, [
          h('h2', { className: 'asc-title', key: 'ti' }, '仓库凭证'),
          h('p', { className: 'asc-sub', key: 's' }, '登记私有远程仓库所需的用户名与令牌；令牌加密保存，只回显掩码。'),
        ]),
        h('div', { className: 'asc-toolbar', key: 'tb' }, [
          h('button', {
            key: 'add', type: 'button', className: 'asc-btn asc-btn--primary',
            onClick: function () { setForm({ open: !form.open, editingId: '', name: '', username: '', secret: '' }) },
            'aria-expanded': form.open ? 'true' : 'false',
            'aria-label': form.open ? '收起新建凭证' : '新建凭证',
          }, form.open ? '取消' : '新建凭证'),
          h('span', { className: 'asc-hint', key: 'count' }, data.credentials.length + ' 个凭证'),
        ]),
        notice
          ? h('div', { className: notice.kind === 'error' ? 'asc-error' : 'asc-ok', role: notice.kind === 'error' ? 'alert' : 'status', key: 'n' },
            [h('span', { key: 'm' }, notice.text)])
          : null,
        formBox,
        data.status === 'loading'
          ? h('div', { className: 'asc-skeleton', key: 'sk' }, [0, 1].map(function (slot) {
            return h('div', { className: 'asc-skelCard', key: slot, style: { height: '64px' } })
          }))
          : rows.length === 0
            ? h('div', { className: 'asc-empty', key: 'empty' }, [
              h('div', { key: 'a' }, '还没有仓库凭证'),
              h('div', { key: 'b' }, '私有仓库需要令牌才能克隆；登记仓库时选择对应凭证即可。'),
            ])
            : h('div', { className: 'asc-roleList', key: 'rows' }, rows),
      ])
    }

    /** 会话模型：设置里选择新会话默认使用的模型（会话页不再提供选择）。 */
    function AscoderModelSection() {
      var dataHook = React.useState({ status: 'loading', current: null, options: [], error: '' })
      var data = dataHook[0]
      var setData = dataHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/models')
          .then(function (payload) {
            setData({ status: 'ready', current: payload.current, options: payload.options || [], error: '' })
          })
          .catch(function (failure) {
            setData({ status: 'error', current: null, options: [], error: failure.message })
          })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      function pick(option) {
        if (busy !== '') return
        setBusy(option.provider + '/' + option.model)
        setNotice(null)
        ;(async function () {
          try {
            await apiAction({ op: 'model.set', provider: option.provider, model: option.model })
            var payload = await apiGet('/api/ascoder/models')
            var saved = payload.current
            setData({ status: 'ready', current: saved, options: payload.options || [], error: '' })
            if (saved && saved.provider === option.provider && saved.model === option.model) {
              setNotice({ kind: 'ok', text: '已设为默认模型，新会话使用它' })
            } else {
              setNotice({ kind: 'error', text: '宿主未开放配置写入，模型没有保存' })
            }
          } catch (failure) {
            setNotice({ kind: 'error', text: failure.message })
          } finally {
            setBusy('')
          }
        })()
      }

      var groups = []
      var index = {}
      for (var i = 0; i < data.options.length; i += 1) {
        var option = data.options[i]
        if (!index[option.provider]) {
          index[option.provider] = { provider: option.provider, providerName: option.providerName, options: [] }
          groups.push(index[option.provider])
        }
        index[option.provider].options.push(option)
      }

      var rows = []
      for (var g = 0; g < groups.length; g += 1) {
        var group = groups[g]
        rows.push(h('div', { className: 'asc-groupLabel', key: 'g-' + group.provider, style: { marginTop: g === 0 ? 0 : '12px' } },
          [h('span', { key: 'n' }, group.providerName)]))
        for (var k = 0; k < group.options.length; k += 1) {
          var opt = group.options[k]
          var active = !!data.current && data.current.provider === opt.provider && data.current.model === opt.model
          rows.push(h('button', {
            key: group.provider + '/' + opt.model,
            type: 'button',
            className: 'asc-branchRow' + (active ? ' asc-branchRow--active' : ''),
            onClick: function (item) { return function () { pick(item) } }(opt),
            'aria-pressed': active ? 'true' : 'false',
            'aria-label': '把 ' + opt.name + ' 设为默认模型',
            disabled: busy !== '',
          }, [
            h('span', { className: 'asc-name', key: 'n' }, opt.name),
            active ? h('span', { className: 'asc-pill asc-pill--ready', key: 's' }, '当前') : null,
            busy === opt.provider + '/' + opt.model ? h('span', { className: 'asc-hint', key: 'b' }, '保存中…') : null,
          ]))
        }
      }

      return h('div', { className: 'asc-panel', style: { maxWidth: '620px' } }, [
        h('div', { className: 'asc-header', key: 'h' }, [
          h('div', { key: 't' }, [
            h('h2', { className: 'asc-title', key: 'ti' }, '会话模型'),
            h('p', { className: 'asc-sub', key: 's' }, '新会话默认使用的模型；会话页面不再提供模型选择。'),
          ]),
        ]),
        notice
          ? h('div', { className: notice.kind === 'error' ? 'asc-error' : 'asc-ok', role: notice.kind === 'error' ? 'alert' : 'status', key: 'n' },
            [h('span', { key: 'm' }, notice.text)])
          : null,
        data.status === 'loading'
          ? h('div', { className: 'asc-skeleton', key: 'sk' }, [0, 1, 2].map(function (slot) {
            return h('div', { className: 'asc-skelCard', key: slot, style: { height: '44px' } })
          }))
          : data.status === 'error'
            ? h('div', { className: 'asc-error', role: 'alert', key: 'err' }, [h('span', { key: 'm' }, data.error)])
            : rows.length === 0
              ? h('div', { className: 'asc-empty', key: 'empty' }, [
                h('div', { key: 'a' }, '没有可用模型'),
                h('div', { key: 'b' }, '先到「模型」页配置提供商的 API Key。'),
              ])
              : h('div', { className: 'asc-list', key: 'rows' }, rows),
      ])
    }

    /** 回答视角（设置里管理定义：风格、提示词、结构）；具体选择在会话页。 */
    function AscoderRolesSection() {
      var dataHook = React.useState({ status: 'loading', roles: [] })
      var data = dataHook[0]
      var setData = dataHook[1]

      var formHook = React.useState({ open: false, editingId: '', name: '', description: '', instruction: '', structure: '' })
      var form = formHook[0]
      var setForm = formHook[1]

      var expandHook = React.useState('')
      var expanded = expandHook[0]
      var setExpanded = expandHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/state')
          .then(function (payload) {
            var roles = (payload && payload.roles) || { list: [] }
            setData({ status: 'ready', roles: roles.list || [] })
          })
          .catch(function (failure) { setNotice({ kind: 'error', text: failure.message }) })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      function act(key, action, after) {
        if (busy !== '') return
        setBusy(key)
        setNotice(null)
        ;(async function () {
          try {
            await action()
            await reload()
            if (after) after()
          } catch (failure) {
            setNotice({ kind: 'error', text: failure.message })
          } finally {
            setBusy('')
          }
        })()
      }

      function submit(event) {
        event.preventDefault()
        if (form.name.trim() === '' || form.instruction.trim() === '') return
        act('save', async function () {
          await apiAction({
            op: 'role.save',
            ...(form.editingId ? { roleId: form.editingId } : {}),
            name: form.name.trim(),
            description: form.description.trim(),
            structure: form.structure.trim(),
            instruction: form.instruction.trim(),
          })
        }, function () {
          setForm({ open: false, editingId: '', name: '', description: '', instruction: '', structure: '' })
        })
      }

      var rows = []
      for (var i = 0; i < data.roles.length; i += 1) {
        var role = data.roles[i]
        var open = expanded === role.id
        rows.push(h('div', { className: 'asc-roleRow', key: role.id }, [
          h('div', { className: 'asc-roleHead', key: 'h' }, [
            h('div', { className: 'asc-roleText', key: 't' }, [
              h('div', { className: 'asc-spaceName', key: 'n' }, [
                h('span', { className: 'asc-name', key: 'name' }, role.name),
                role.builtin
                  ? h('span', { className: 'asc-pill', key: 'b' }, '内置')
                  : h('span', { className: 'asc-pill', key: 'c' }, '自定义'),
              ]),
              role.description
                ? h('div', { className: 'asc-desc', key: 'd' }, role.description)
                : null,
            ]),
            h('div', { className: 'asc-memberSide', key: 'a' }, [
              h('button', {
                key: 'toggle', type: 'button', className: 'asc-btn',
                onClick: function (id) { return function () { setExpanded(expanded === id ? '' : id) } }(role.id),
                'aria-expanded': open ? 'true' : 'false',
                'aria-label': (open ? '收起' : '查看') + '视角 ' + role.name,
              }, open ? '收起' : '查看'),
              !role.builtin
                ? h('button', {
                  key: 'edit', type: 'button', className: 'asc-btn',
                  onClick: function (item) {
                    return function () {
                      setForm({
                        open: true, editingId: item.id, name: item.name,
                        description: item.description || '', instruction: item.instruction,
                        structure: item.structure || '',
                      })
                    }
                  }(role),
                  'aria-label': '编辑视角 ' + role.name,
                }, '编辑')
                : null,
              !role.builtin
                ? h('button', {
                  key: 'rm', type: 'button', className: 'asc-btn asc-btn--danger',
                  onClick: function (item) {
                    return function () {
                      if (typeof window !== 'undefined' && typeof window.confirm === 'function'
                        && !window.confirm('删除视角「' + item.name + '」？')) return
                      act('remove', function () { return apiAction({ op: 'role.remove', roleId: item.id }) })
                    }
                  }(role),
                  disabled: busy !== '',
                  'aria-label': '删除视角 ' + role.name,
                }, '删除')
                : null,
            ]),
          ]),
          open
            ? h('div', { className: 'asc-roleDetail', key: 'd' }, [
              h('div', { className: 'asc-roleField', key: 's' }, [
                h('div', { className: 'asc-label', key: 'l' }, '回答结构'),
                h('div', { className: 'asc-roleValue', key: 'v' }, role.structure || '（未设置）'),
              ]),
              h('div', { className: 'asc-roleField', key: 'p' }, [
                h('div', { className: 'asc-label', key: 'l' }, '提示词'),
                h('pre', { className: 'asc-rolePrompt', key: 'v' }, role.instruction),
              ]),
            ])
            : null,
        ]))
      }

      var formBox = form.open
        ? h('form', { className: 'asc-form', key: 'f', onSubmit: submit }, [
          h('div', { className: 'asc-row', key: 'top' }, [
            h('div', { className: 'asc-field', key: 'n' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-role-name', key: 'l' }, '视角名称'),
              h('input', {
                key: 'i', id: 'asc-role-name', className: 'asc-input', type: 'text', value: form.name,
                placeholder: '例如：架构师', autoComplete: 'off',
                onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: event.target.value, description: form.description, instruction: form.instruction, structure: form.structure }) },
              }),
            ]),
            h('div', { className: 'asc-field', key: 'd' }, [
              h('label', { className: 'asc-label', htmlFor: 'asc-role-desc', key: 'l' }, '风格（一句话）'),
              h('input', {
                key: 'i', id: 'asc-role-desc', className: 'asc-input', type: 'text', value: form.description,
                placeholder: '例如：面向架构决策的取舍分析', autoComplete: 'off',
                onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: form.name, description: event.target.value, instruction: form.instruction, structure: form.structure }) },
              }),
            ]),
          ]),
          h('div', { className: 'asc-field', key: 's' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-role-structure', key: 'l' }, '回答结构'),
            h('input', {
              key: 'i', id: 'asc-role-structure', className: 'asc-input', type: 'text', value: form.structure,
              placeholder: '例如：结论 → 方案对比 → 风险 → 证据', autoComplete: 'off',
              onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: form.name, description: form.description, instruction: form.instruction, structure: event.target.value }) },
            }),
          ]),
          h('div', { className: 'asc-field', key: 'r' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-role-instruction', key: 'l' }, '提示词（每行一条，注入系统提示词）'),
            h('textarea', {
              key: 'i', id: 'asc-role-instruction', className: 'asc-input asc-textarea', value: form.instruction,
              rows: 6,
              placeholder: '结论放在最前面\n先给取舍再看细节\n证据放到回答最后',
              onChange: function (event) { setForm({ open: true, editingId: form.editingId, name: form.name, description: form.description, instruction: event.target.value, structure: form.structure }) },
            }),
          ]),
          h('div', { className: 'asc-row', key: 'a' }, [
            h('button', { key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary', disabled: busy !== '' }, busy === 'save' ? '保存中…' : '保存视角'),
            h('button', {
              key: 'c', type: 'button', className: 'asc-btn',
              onClick: function () { setForm({ open: false, editingId: '', name: '', description: '', instruction: '', structure: '' }) },
              'aria-label': '取消编辑视角',
            }, '取消'),
          ]),
        ])
        : null

      return h('div', { className: 'asc-panel', style: { maxWidth: '660px' } }, [
        h('div', { key: 'h' }, [
          h('h2', { className: 'asc-title', key: 'ti' }, '回答视角'),
          h('p', { className: 'asc-sub', key: 's' }, '管理视角的**风格、提示词与回答结构**；用哪个视角在会话页面里选择。'.replace(/\*\*/g, '')),
        ]),
        h('div', { className: 'asc-toolbar', key: 'tb' }, [
          h('button', {
            key: 'add', type: 'button', className: 'asc-btn asc-btn--primary',
            onClick: function () { setForm({ open: !form.open, editingId: '', name: '', description: '', instruction: '', structure: '' }) },
            'aria-expanded': form.open ? 'true' : 'false',
            'aria-label': form.open ? '收起新建视角' : '新建视角',
          }, form.open ? '取消' : '新建视角'),
          h('span', { className: 'asc-hint', key: 'count' }, data.roles.length + ' 个视角'),
        ]),
        notice
          ? h('div', { className: notice.kind === 'error' ? 'asc-error' : 'asc-ok', role: notice.kind === 'error' ? 'alert' : 'status', key: 'n' },
            [h('span', { key: 'm' }, notice.text)])
          : null,
        formBox,
        data.status === 'loading'
          ? h('div', { className: 'asc-skeleton', key: 'sk' }, [0, 1].map(function (slot) {
            return h('div', { className: 'asc-skelCard', key: slot, style: { height: '64px' } })
          }))
          : h('div', { className: 'asc-roleList', key: 'rows' }, rows),
      ])
    }

    /** 会话输入框里的分支标签：说明当前会话属于哪个分支空间。 */
    /** 切换分支的乐观目标（会话重挂载会重建组件，用它跨实例保留）。 */
    var pendingBranchTarget = null

    /** 最近一次读取到的视角数据（会话重挂载时先渲染它，避免标签闪空）。 */
    var lastRoleData = null

    /** 当前分支空间标题（只由"选中的会话行"更新，分组行不算）。 */
    var currentBranchTitle = null

    /** 切换遮罩的最短展示时长：切换很快时也保证动效可见、期间真的拦住操作。 */
    var SWITCH_OVERLAY_MIN_MS = 600
    var switchOverlayStartedAt = 0
    var switchOverlayHideTimer = 0

    /**
     * 会话页底部的分支控制栏：显示当前分支、切换分支、更新当前分支。
     *
     * 数据来自当前会话的工作区标题「项目 · 分支」：据此反查项目与分支空间，
     * 切换分支复用 space.enter（未准备时先跑准备任务），更新走 space.sync 任务。
     */
    function AscoderBranchBar() {
      var titleHook = React.useState(currentSpaceTitle)
      var title = titleHook[0]
      var setTitle = titleHook[1]

      var contextHook = React.useState(function () {
        if (!pendingBranchTarget) return null
        return { project: pendingBranchTarget.project, space: pendingBranchTarget.space, branch: pendingBranchTarget.branch }
      })
      var context = contextHook[0]
      var setContext = contextHook[1]

      // 上下文读取状态：切换会话/分组时重新读取，期间展示动效并锁住工具栏
      var statusHook = React.useState('loading')
      var contextStatus = statusHook[0]
      var setContextStatus = statusHook[1]
      var refreshHook = React.useState(0)
      var refreshKey = refreshHook[0]
      var setRefreshKey = refreshHook[1]

      var menuHook = React.useState({ open: false, loading: false, branches: null, error: '' })
      var menu = menuHook[0]
      var setMenu = menuHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      // 旧仓库动辄上万个历史分支，菜单必须能过滤并限制渲染条数
      var filterHook = React.useState('')
      var filter = filterHook[0]
      var setFilter = filterHook[1]

      var noticeHook = React.useState('')
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      // 切换分支时的乐观目标：立即把胶囊显示成目标分支，避免回落成旧分支再跳变
      var pendingHook = React.useState(function () { return pendingBranchTarget ? pendingBranchTarget.branch : '' })
      var pendingBranch = pendingHook[0]
      var setPendingBranch = pendingHook[1]

      // 标题同步：侧栏选中变化时立即读一次；瞬时读不到（切换会话渲染中）时保留旧值 900ms
      React.useEffect(function () {
        if (typeof document === 'undefined') return undefined
        var clearTimer = 0
        var tree = null
        var observer = null
        var lastSessionKey = selectedSessionKey()

        var sync = function () {
          // 选中会话变化：重新读取分支上下文（空间状态可能已变）
          var sessionKey = selectedSessionKey()
          if (sessionKey !== lastSessionKey) {
            lastSessionKey = sessionKey
            setRefreshKey(function (previous) { return previous + 1 })
          }
          var next = currentSpaceTitle()
          if (next) {
            if (clearTimer) {
              clearTimeout(clearTimer)
              clearTimer = 0
            }
            setTitle(function (previous) { return previous === next ? previous : next })
            return
          }
          if (clearTimer) return
          clearTimer = setTimeout(function () {
            clearTimer = 0
            setTitle(null)
          }, 900)
        }

        var attach = function () {
          var next = document.querySelector('[role="tree"]')
          if (!next || next === tree) return
          tree = next
          if (observer) observer.disconnect()
          if (typeof MutationObserver !== 'function') return
          observer = new MutationObserver(function () { sync() })
          observer.observe(tree, {
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-selected', 'data-row-key'],
            childList: true,
          })
        }

        sync()
        attach()
        var timer = setInterval(function () { sync(); attach() }, 1500)
        return function () {
          clearInterval(timer)
          if (clearTimer) clearTimeout(clearTimer)
          if (observer) observer.disconnect()
        }
      }, [])

      // 标题变化（或切换了会话）时解析项目与分支空间
      React.useEffect(function () {
        if (!title) {
          if (!pendingBranch) {
            setContext(null)
            setContextStatus('idle')
          }
          return undefined
        }
        var stopped = false
        var parts = String(title).split(' · ')
        var projectName = (parts[0] || '').trim()
        var branch = parts.length > 1 ? parts.slice(1).join(' · ').trim() : ''
        // 正在切分支：旧标题的解析结果先忽略，等侧栏真正选中目标分支再更新
        if (pendingBranch && branch !== pendingBranch) return undefined
        setContextStatus('loading')
        apiGet('/api/ascoder/state').then(function (payload) {
          if (stopped) return
          var projects = (payload && payload.projects) || []
          var project = null
          for (var i = 0; i < projects.length; i += 1) {
            if (projects[i].name === projectName) { project = projects[i]; break }
          }
          if (!project) {
            for (var j = 0; j < projects.length && !project; j += 1) {
              var spaces = projects[j].spaces || []
              for (var k = 0; k < spaces.length; k += 1) {
                if (spaces[k].branch === branch) { project = projects[j]; break }
              }
            }
          }
          if (!project || !branch) {
            setContext(null)
            setContextStatus('idle')
            return
          }
          var space = null
          var projectSpaces = project.spaces || []
          for (var m = 0; m < projectSpaces.length; m += 1) {
            if (projectSpaces[m].branch === branch) { space = projectSpaces[m]; break }
          }
          setContext({ project: project, space: space, branch: branch })
          setContextStatus('ready')
          // 侧栏真正落到目标分支：乐观值使命完成
          if (branch === pendingBranch) {
            pendingBranchTarget = null
            setPendingBranch('')
          }
        }).catch(function () {
          if (stopped) return
          setContext(null)
          setContextStatus('idle')
        })
        return function () { stopped = true }
      }, [title, pendingBranch, refreshKey])

      // 兜底：15 秒还没追上就放弃乐观值
      React.useEffect(function () {
        if (!pendingBranch) return undefined
        var timer = setTimeout(function () {
          pendingBranchTarget = null
          setPendingBranch('')
        }, 15000)
        return function () { clearTimeout(timer) }
      }, [pendingBranch])

      var closeMenu = React.useCallback(function () {
        setFilter('')
        setMenu({ open: false, loading: false, branches: null, error: '' })
      }, [])

      var openMenu = React.useCallback(function () {
        if (!context) return
        setNotice('')
        setFilter('')
        setMenu({ open: true, loading: true, branches: null, error: '' })
        apiGet('/api/ascoder/branches?projectId=' + encodeURIComponent(context.project.id))
          .then(function (payload) {
            setMenu({ open: true, loading: false, branches: payload || { local: [], remote: [] }, error: '' })
          })
          .catch(function (failure) {
            setMenu({ open: true, loading: false, branches: null, error: failure.message })
          })
      }, [context])

      var switchTo = React.useCallback(function (nextBranch) {
        if (!context || busy) return
        setMenu({ open: false, loading: false, branches: null, error: '' })
        setNotice('')
        setBusy('切换分支…')
        setPendingBranch(nextBranch)
        pendingBranchTarget = { project: context.project, space: null, branch: nextBranch }
        emitSwitchEvent({ active: true, branch: nextBranch, message: '正在切换分支空间…' })
        var project = context.project
        // 立即把胶囊与菜单指向目标分支（空间可能尚未创建）
        var optimisticSpace = null
        for (var oi = 0; oi < (project.spaces || []).length; oi += 1) {
          if (project.spaces[oi].branch === nextBranch) { optimisticSpace = project.spaces[oi]; break }
        }
        setContext({ project: project, space: optimisticSpace, branch: nextBranch })
        pendingBranchTarget = { project: project, space: optimisticSpace, branch: nextBranch }
        ;(async function () {
          var space = null
          var projectSpaces = project.spaces || []
          for (var i = 0; i < projectSpaces.length; i += 1) {
            if (projectSpaces[i].branch === nextBranch) { space = projectSpaces[i]; break }
          }
          // 进入（必要时先建空间 + 等准备任务）——失败时会被外层接住并触发自动修复
          var enterSpace = async function () {
            if (!space) {
              space = await apiAction({ op: 'space.create', projectId: project.id, branch: nextBranch })
            }
            var result = await apiAction({ op: 'space.enter', projectId: project.id, spaceId: space.id })
            if (result && result.taskId) {
              await pollTask(result.taskId, function (task) {
                var hint = (task.message || '准备分支空间…') + (task.progress.total > 0 ? '（' + task.progress.done + '/' + task.progress.total + '）' : '')
                setBusy(hint)
                emitSwitchEvent({ active: true, branch: nextBranch, message: hint })
              })
              result = await apiAction({ op: 'space.enter', projectId: project.id, spaceId: space.id })
            }
            return result
          }

          var data = null
          try {
            data = await enterSpace()
          } catch (failure) {
            // 成员缺分支导致准备失败时，自动按候选分支修复一次再重试
            if (!space || !space.id) throw failure
            var repairHint = '准备失败，正在自动匹配分支修复…'
            setBusy(repairHint)
            emitSwitchEvent({ active: true, branch: nextBranch, message: repairHint })
            var plan = await apiAction({ op: 'space.autoPlan', projectId: project.id, branch: nextBranch })
            if (plan && plan.taskId) {
              await pollTask(plan.taskId, function (task) {
                var hint = task.message || repairHint
                setBusy(hint)
                emitSwitchEvent({ active: true, branch: nextBranch, message: hint })
              })
            }
            data = await enterSpace()
          }
          emitSwitchEvent({ active: true, branch: nextBranch, message: '正在打开分支会话…' })
          var workspaceId = data && data.workspaceId
          if (!workspaceId) throw new Error('宿主未提供工作区能力，无法切换分支')
          await openWorkspaceSession(workspaceId)
          rememberSpaceTitle(project.name + ' · ' + (space.branch || nextBranch))
          emitSwitchEvent({ active: false })
        })().catch(function (failure) {
          pendingBranchTarget = null
          setPendingBranch('')
          setNotice('切换失败：' + failure.message)
          emitSwitchEvent({ active: false })
        }).then(function () {
          setBusy('')
        })
      }, [context, busy])

      var updateBranch = React.useCallback(function () {
        if (!context || !context.space || busy) return
        setNotice('')
        setBusy('正在拉取代码…')
        apiAction({ op: 'space.sync', projectId: context.project.id, spaceId: context.space.id })
          .then(function (data) {
            if (!data || !data.taskId) return null
            return pollTask(data.taskId, function (task) {
              setBusy(task.message ? task.message : '更新中…')
            })
          })
          .then(function () {
            setNotice('已更新')
          })
          .catch(function (failure) {
            setNotice('更新失败：' + failure.message)
          })
          .then(function () {
            setBusy('')
          })
      }, [context, busy])

      // 成功提示自行淡出，失败提示保留到下次操作
      React.useEffect(function () {
        if (notice !== '已更新') return undefined
        var timer = setTimeout(function () { setNotice('') }, 3200)
        return function () { clearTimeout(timer) }
      }, [notice])

      // 菜单打开时：Esc 关闭、点击外部关闭
      React.useEffect(function () {
        if (!menu.open) return undefined
        var onKey = function (event) { if (event.key === 'Escape') closeMenu() }
        var onDown = function (event) {
          var target = event.target
          if (target && target.closest && target.closest('.asc-branchBar')) return
          closeMenu()
        }
        document.addEventListener('keydown', onKey)
        document.addEventListener('pointerdown', onDown, true)
        return function () {
          document.removeEventListener('keydown', onKey)
          document.removeEventListener('pointerdown', onDown, true)
        }
      }, [menu.open])

      // 标题里的分支名（不依赖接口，切换会话瞬间就能拿到）
      var titleBranch = ''
      if (title) {
        var titleParts = String(title).split(' · ')
        if (titleParts.length > 1) titleBranch = titleParts.slice(1).join(' · ').trim()
      }
      // 既没有上下文也没有分支标题：不是分支空间会话（仓库根目录等），不渲染
      if (!context && titleBranch === '') return null
      // 上下文还在解析：先显示骨架胶囊（小鸟 + 读取中），并锁住整条工具栏
      var resolving = contextStatus === 'loading'
      var updating = busy !== '' && busy.indexOf('切换') < 0
      var branchLabel = pendingBranch || (context ? context.branch : titleBranch)
      var spaceReady = context && context.space ? context.space.status === 'ready' : false
      var titleLabel = title || (context ? context.project.name + ' · ' + context.branch : branchLabel)

      var icon = function (key, className, paths) {
        return h('svg', {
          key: key,
          className: className,
          width: 13,
          height: 13,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        }, paths)
      }
      var branchIcon = icon('i', 'asc-branchPillIcon', [
        h('circle', { key: 'a', cx: 6, cy: 6, r: 2.2 }),
        h('circle', { key: 'b', cx: 6, cy: 18, r: 2.2 }),
        h('circle', { key: 'c', cx: 18, cy: 8, r: 2.2 }),
        h('path', { key: 'p', d: 'M6 8.2v7.6M8.2 6h5.3a2.3 2.3 0 0 1 0 4.6H8.2' }),
      ])
      var chevronIcon = icon('c', 'asc-branchChevron', [h('path', { key: 'p', d: 'M6 9l6 6 6-6' })])
      var refreshIcon = icon('r', 'asc-branchActionIcon', [
        h('path', { key: 'a', d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { key: 'b', d: 'M20 5v6h-6' }),
      ])
      var checkIcon = icon('k', 'asc-branchMenuCheck', [h('path', { key: 'p', d: 'M5 12.5l4.5 4.5L19 7.5' })])
      var plusIcon = icon('p', 'asc-branchMenuCheck', [h('path', { key: 'h', d: 'M12 6v12M6 12h12' })])

      var spaceBranches = {}
      if (context && context.project && context.project.spaces) {
        for (var si = 0; si < context.project.spaces.length; si += 1) {
          spaceBranches[context.project.spaces[si].branch] = context.project.spaces[si]
        }
      }
      var branchNames = []
      var seenBranches = {}
      function pushBranch(name) {
        if (!name || seenBranches[name]) return
        seenBranches[name] = true
        branchNames.push(name)
      }
      if (menu.branches) {
        for (var li = 0; li < (menu.branches.local || []).length; li += 1) pushBranch(menu.branches.local[li])
        for (var ri = 0; ri < (menu.branches.remote || []).length; ri += 1) pushBranch(menu.branches.remote[ri])
      }
      for (var sb in spaceBranches) pushBranch(sb)
      var withSpace = []
      var withoutSpace = []
      for (var bi = 0; bi < branchNames.length; bi += 1) {
        if (spaceBranches[branchNames[bi]]) withSpace.push(branchNames[bi])
        else withoutSpace.push(branchNames[bi])
      }
      withSpace.sort(function (a, b) { return a === branchLabel ? -1 : b === branchLabel ? 1 : a.localeCompare(b) })
      // 顺序来自后端（按最近提交时间倒序），这里不要按字母序重排

      var BRANCH_MENU_LIMIT = 40
      var SPACE_MENU_LIMIT = 20
      var query = String(filter || '').trim().toLowerCase()

      // 相关度：完全匹配 → 末段匹配（如 v4.3.x/release）→ 前缀 → 段前缀 → 段包含 → 任意位置
      var relevanceOf = function (name) {
        var lower = String(name).toLowerCase()
        if (lower === query) return 0
        var segments = lower.split('/')
        if (segments[segments.length - 1] === query) return 1
        if (lower.indexOf(query) === 0) return 2
        var i
        for (i = 0; i < segments.length; i += 1) {
          if (segments[i].indexOf(query) === 0) return 3
        }
        for (i = 0; i < segments.length; i += 1) {
          if (segments[i].indexOf(query) !== -1) return 4
        }
        return 5
      }

      var matchedBranches = withoutSpace
      if (query) {
        matchedBranches = withoutSpace
          .filter(function (name) { return String(name).toLowerCase().indexOf(query) !== -1 })
          .map(function (name, index) { return { name: name, index: index, score: relevanceOf(name) } })
          .sort(function (a, b) { return a.score - b.score || a.index - b.index })
          .map(function (item) { return item.name })
      }
      var shownBranches = matchedBranches.slice(0, BRANCH_MENU_LIMIT)
      var hiddenBranches = matchedBranches.length - shownBranches.length
      var shownSpaces = withSpace.slice(0, SPACE_MENU_LIMIT)
      var hiddenSpaces = withSpace.length - shownSpaces.length
      var needSearch = withoutSpace.length > BRANCH_MENU_LIMIT

      var menuItem = function (name, hasSpace, first) {
        var isCurrent = name === branchLabel
        return h('button', {
          key: 'b-' + name,
          type: 'button',
          className: 'asc-branchMenuItem' + (isCurrent ? ' asc-branchMenuItem--current' : ''),
          role: 'menuitem',
          autoFocus: first === true && !isCurrent,
          disabled: isCurrent || Boolean(busy),
          onClick: function () { switchTo(name) },
          'aria-label': '切换到分支 ' + name,
        }, [
          isCurrent ? checkIcon : hasSpace ? branchIcon : plusIcon,
          h('span', { key: 'n', className: 'asc-branchMenuName' }, name),
          h('span', { key: 'm', className: 'asc-branchMenuMeta' }, isCurrent ? '当前' : hasSpace ? '已有空间' : '新建空间'),
        ])
      }

      return h('span', {
        className: 'asc-branchBar' + (resolving ? ' asc-branchBar--loading' : ''),
        role: 'group',
        'aria-label': resolving ? '分支控制（正在读取分支信息）' : '分支控制',
        'aria-busy': resolving ? 'true' : 'false',
        // 键盘事件从胶囊或菜单冒泡到这里，统一处理，菜单打开时 ↑/↓ 才有效
        onKeyDown: function (event) {
          if (!menu.open) return
          menuKeyboard(closeMenu)(event)
        },
      }, [
        h('button', {
          key: 'pill',
          type: 'button',
          className: 'asc-branchPill' + (menu.open ? ' asc-branchPill--open' : '') + (spaceReady ? '' : ' asc-branchPill--pending') + (resolving ? ' asc-branchPill--loading' : ''),
          title: '当前分支空间：' + titleLabel,
          onClick: function () { menu.open ? closeMenu() : openMenu() },
          'aria-haspopup': 'menu',
          'aria-expanded': menu.open ? 'true' : 'false',
          'aria-label': resolving ? '正在读取分支信息' : '当前分支 ' + branchLabel + '，点击切换分支',
          disabled: resolving,
        }, [
          resolving
            ? h('span', { key: 'bird', className: 'asc-branchBird', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 13, live: true })])
            : branchIcon,
          h('span', { key: 'n', className: 'asc-branchPillName' }, branchLabel),
          context && context.space && !spaceReady ? h('span', { key: 's', className: 'asc-branchPillState' }, '待准备') : null,
          chevronIcon,
        ]),
        h('span', { key: 'div', className: 'asc-branchDivider', 'aria-hidden': 'true' }),
        h('button', {
          key: 'update',
          type: 'button',
          className: 'asc-branchAction' + (updating ? ' asc-branchAction--busy' : ''),
          onClick: updateBranch,
          'aria-label': updating ? '正在更新当前分支' : '更新当前分支',
          title: 'git fetch + pull --ff-only',
          disabled: !context || !context.space || Boolean(busy),
        }, [
          updating
            ? h('span', { key: 'bird', className: 'asc-branchBird', 'aria-hidden': 'true' }, [h(AscoderBird, { size: 15, live: true })])
            : refreshIcon,
          h('span', { key: 't' }, updating ? '拉取中' : '更新'),
        ]),
        updating
          ? h('span', { key: 'progress', className: 'asc-branchProgress', 'aria-hidden': 'true' }, [
            h('span', { key: 'bar', className: 'asc-branchProgressBar' }),
          ])
          : null,
        busy && !updating
          ? h('span', { key: 'busy', className: 'asc-branchBarHint' }, busy)
          : (updating && busy !== '正在拉取代码…'
            ? h('span', { key: 'step', className: 'asc-branchBarHint' }, busy)
            : null),
        notice
          ? h('span', {
            key: 'notice',
            className: 'asc-branchBarHint ' + (notice.indexOf('已更新') === 0 ? 'asc-branchBarHint--ok' : 'asc-branchBarHint--error'),
            role: 'status',
          }, [
            notice.indexOf('已更新') === 0
              ? h('svg', {
                key: 'c', className: 'asc-branchBarCheck', width: 12, height: 12, viewBox: '0 0 24 24',
                fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round',
                'aria-hidden': 'true',
              }, [h('path', { key: 'p', d: 'M5 12.5l4.5 4.5L19 7.5' })])
              : null,
            h('span', { key: 't' }, notice),
          ])
          : null,
        menu.open
          ? h('div', {
            className: 'asc-branchMenu',
            role: 'menu',
            key: 'menu',
            'aria-label': '选择分支',
          }, [
            h('div', { key: 'head', className: 'asc-branchMenuHead' }, [
              h('span', { key: 't', className: 'asc-branchMenuTitle' }, '切换分支'),
              h('button', {
                key: 'x',
                type: 'button',
                className: 'asc-branchMenuClose',
                onClick: closeMenu,
                'aria-label': '关闭分支菜单',
              }, '×'),
            ]),
            needSearch
              ? h('input', {
                key: 'search',
                type: 'search',
                className: 'asc-branchMenuSearch',
                placeholder: '搜索 ' + withoutSpace.length + ' 个分支…',
                value: filter,
                onInput: function (event) { setFilter(event.target.value) },
                'aria-label': '搜索分支',
              })
              : null,
            menu.loading ? h('div', { key: 'l', className: 'asc-hint asc-branchMenuHint' }, '读取分支…') : null,
            menu.error ? h('div', { key: 'e', className: 'asc-branchMenuHint asc-hint--error' }, menu.error) : null,
            shownSpaces.length > 0
              ? h('div', { key: 'group-space', className: 'asc-branchMenuGroup' }, [
                h('div', { key: 'h', className: 'asc-branchMenuGroupTitle' }, '已有空间'),
                shownSpaces.map(function (name, index) { return menuItem(name, true, index === 0) }),
                hiddenSpaces > 0
                  ? h('div', { key: 'more', className: 'asc-branchMenuEmpty' }, '还有 ' + hiddenSpaces + ' 个空间未显示')
                  : null,
              ])
              : null,
            shownBranches.length > 0
              ? h('div', { key: 'group-new', className: 'asc-branchMenuGroup' }, [
                h('div', { key: 'h', className: 'asc-branchMenuGroupTitle' }, query ? '匹配的分支' : '其他分支'),
                shownBranches.map(function (name, index) { return menuItem(name, false, index === 0 && shownSpaces.length === 0) }),
                hiddenBranches > 0
                  ? h('div', { key: 'more', className: 'asc-branchMenuEmpty' }, '还有 ' + hiddenBranches + ' 个分支，输入关键词继续筛选')
                  : null,
              ])
              : withoutSpace.length > 0
                ? h('div', { key: 'group-empty', className: 'asc-branchMenuGroup' }, [
                  h('div', { key: 'empty', className: 'asc-branchMenuEmpty' }, '没有匹配的分支'),
                ])
                : null,
          ])
          : null,
      ])
    }

    /** 会话页的视角选择：只在这一处切换当前使用的视角。 */
    function AscoderRolePicker() {
      // 会话切换会重建组件：先用上次读到的视角数据渲染，避免标签闪空/抖动
      var dataHook = React.useState(function () {
        return lastRoleData || { roles: [], selectedId: '' }
      })
      var data = dataHook[0]
      var setData = dataHook[1]

      var readyHook = React.useState(function () { return lastRoleData !== null })
      var rolesReady = readyHook[0]
      var setRolesReady = readyHook[1]

      var openHook = React.useState(false)
      var open = openHook[0]
      var setOpen = openHook[1]

      var busyHook = React.useState(false)
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/state')
          .then(function (payload) {
            var roles = (payload && payload.roles) || { list: [], selectedId: '' }
            var next = { roles: roles.list || [], selectedId: roles.selectedId || '' }
            lastRoleData = next
            setData(next)
            setRolesReady(true)
          })
          .catch(function () { /* 未登录时静默 */ })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      var current = null
      for (var i = 0; i < data.roles.length; i += 1) {
        if (data.roles[i].id === data.selectedId) current = data.roles[i]
      }

      function pick(role) {
        if (busy) return
        setBusy(true)
        apiAction({ op: 'role.select', roleId: role.id })
          .then(function () { setData({ roles: data.roles, selectedId: role.id }); setOpen(false) })
          .catch(function () { /* 失败保持原样 */ })
          .then(function () { setBusy(false) })
      }

      if (!rolesReady && data.roles.length === 0) {
        return h('span', {
          className: 'asc-roleSkeleton',
          'aria-hidden': 'true',
          title: '正在读取回答视角',
        })
      }

      return h('div', {
        className: 'asc-rolePickWrap',
        onKeyDown: function (event) {
          if (!open) return
          menuKeyboard(function () { setOpen(false) })(event)
        },
      }, [
        h('button', {
          key: 'trigger',
          type: 'button',
          className: 'asc-roleChip',
          onClick: function () { setOpen(!open); if (!open) reload() },
          'aria-expanded': open ? 'true' : 'false',
          'aria-label': '选择回答视角' + (current ? '，当前 ' + current.name : ''),
          title: '选择回答视角',
        }, [
          h('svg', {
            key: 'i', width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
            strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
          }, [
            h('circle', { key: 'c', cx: 12, cy: 8, r: 4 }),
            h('path', { key: 'p', d: 'M4 21c0-4 3.6-7 8-7s8 3 8 7' }),
          ]),
          h('span', { key: 't' }, current ? current.name : '选择视角'),
        ]),
        open
          ? h('div', { className: 'asc-roleMenu', key: 'menu', role: 'menu' }, data.roles.map(function (role, roleIndex) {
            var active = role.id === data.selectedId
            return h('button', {
              key: role.id,
              type: 'button',
              role: 'menuitem',
              autoFocus: roleIndex === 0,
              className: 'asc-roleMenuItem' + (active ? ' asc-roleMenuItem--active' : ''),
              onClick: function () { pick(role) },
              'aria-current': active ? 'true' : 'false',
            }, [
              h('span', { className: 'asc-roleMenuName', key: 'n' }, role.name),
              role.description ? h('span', { className: 'asc-roleMenuDesc', key: 'd' }, role.description) : null,
              active ? h('span', { className: 'asc-pill asc-pill--ready', key: 's' }, '当前') : null,
            ])
          }))
          : null,
      ])
    }

    /** 浏览器通知开关与权限。 */
    /**
     * 「开启浏览器通知」引导条。
     *
     * 通知开关是每台浏览器各自的偏好（localStorage + Notification 权限），
     * 放在需要管理密码的设置页里普通用户根本够不到，所以在输入框下方引导一次：
     * 未读过数据的访客看到「开启通知 / 稍后 / 不再提醒」，做过选择就不再打扰。
     */
    function AscoderNotifyPrompt() {
      var showHook = React.useState(false)
      var show = showHook[0]
      var setShow = showHook[1]

      // 只在会话页出现：输入框旁的角色/分支胶囊由本插件渲染，可作为可靠信号
      React.useEffect(function () {
        function refresh() {
          // 首页浮层（.asc-home）打开时，底下的会话区虽然在 DOM 里且还有尺寸
          //（实测胶囊 87×26 依旧 visible），但它被浮层盖住 —— 只看胶囊会在首页乱弹引导。
          var homeOpen = typeof document !== 'undefined' && document.querySelector('.asc-home') !== null
          var pill = typeof document !== 'undefined'
            ? document.querySelector('.asc-roleChip, .asc-branchPill, .asc-rolePick')
            : null
          // 任务指示器在场时让位：两个浮动卡片叠在一起会互相遮挡
          var taskDockOpen = typeof document !== 'undefined' && document.querySelector('.asc-taskDock') !== null
          var next = !homeOpen && !taskDockOpen && pill !== null && notifyNeedsPrompt() && !dismissedThisSession
          setShow(next)
        }
        refresh()
        var timer = setInterval(refresh, 1200)
        return function () { clearInterval(timer) }
      }, [])

      var busyHook = React.useState(false)
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var errorHook = React.useState('')
      var error = errorHook[0]
      var setError = errorHook[1]

      if (!show) return null

      /** 记住「不再提醒」，之后任何页面都不再弹。 */
      function dismissForever() {
        try { window.localStorage.setItem(NOTIFY_DISMISS_KEY, '1') } catch (notifyError) { /* 隐私模式忽略 */ }
        setShow(false)
      }

      /** 请求权限并开启；被拒绝时给出可操作的说明而不是静默失败。 */
      function enable() {
        if (busy) return
        setBusy(true)
        setError('')
        Promise.resolve()
          .then(function () {
            if (notifyPermission() === 'granted') return 'granted'
            return requestNotifyPermission()
          })
          .then(function (permission) {
            if (permission !== 'granted') {
              setError('浏览器拒绝了通知权限：点地址栏左侧的站点设置，把「通知」改成允许后刷新')
              return
            }
            setNotifyEnabled(true)
            setShow(false)
            try {
              var notification = new window.Notification('Ascoder 通知已开启', {
                body: '回答完成且标签页在后台时会提醒你',
                icon: ASC_BIRD_SVG_URI,
                tag: 'ascoder-notify-on',
              })
              notification.onclick = function () { try { window.focus() } catch (focusError) { /* 忽略 */ } notification.close() }
            } catch (notifyError) { /* 通知失败不影响开关 */ }
          })
          .catch(function (failure) { setError(failure && failure.message ? failure.message : '开启失败，请重试') })
          .then(function () { setBusy(false) })
      }

      return h('div', { className: 'asc-notifyGuide', role: 'region', 'aria-label': '浏览器通知引导' }, [
        h('span', { key: 'icon', className: 'asc-notifyGuideIcon', 'aria-hidden': 'true' }, [ascIcon('bell', 15)]),
        h('div', { key: 'body', className: 'asc-notifyGuideBody' }, [
          h('span', { key: 'title', className: 'asc-notifyGuideTitle' }, '开启浏览器通知'),
          h('span', { key: 'text', className: 'asc-notifyGuideText' },
            error || '回答完成时如果这个标签页在后台，会提醒你一声。只影响这台浏览器。'),
          h('div', { key: 'actions', className: 'asc-notifyGuideActions' }, [
            h('button', {
              key: 'enable', type: 'button', className: 'asc-btn asc-btn--primary asc-btn--sm',
              disabled: busy, onClick: enable,
            }, busy ? '开启中…' : '开启通知'),
            h('button', {
              key: 'later', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
              disabled: busy, onClick: function () { dismissedThisSession = true; setShow(false) },
            }, '稍后'),
            h('button', {
              key: 'never', type: 'button', className: 'asc-notifyGuideLink', onClick: dismissForever,
            }, '不再提醒'),
          ]),
        ]),
        h('button', {
          key: 'close', type: 'button', className: 'asc-notifyGuideClose',
          'aria-label': '关闭通知引导', onClick: function () { dismissedThisSession = true; setShow(false) },
        }, '×'),
      ])
    }

    function AscoderNotifySection() {
      var stateHook = React.useState({ enabled: notifyEnabled(), permission: notifyPermission(), notice: null })
      var state = stateHook[0]
      var setState = stateHook[1]

      function refresh(notice) {
        setState({ enabled: notifyEnabled(), permission: notifyPermission(), notice: notice || null })
      }

      function toggle(event) {
        var next = !!event.target.checked
        if (!next) {
          setNotifyEnabled(false)
          refresh({ kind: 'ok', text: '已关闭通知' })
          return
        }
        ;(async function () {
          var environment = notifyEnvironment()
          if (!environment.secure) {
            setNotifyEnabled(false)
            refresh({
              kind: 'error',
              text: '当前是 HTTP 访问（' + environment.origin + '），浏览器只在 HTTPS 或 localhost 下允许系统通知；请改用 HTTPS 访问',
            })
            return
          }
          var permission = notifyPermission()
          if (permission === 'unsupported') {
            refresh({ kind: 'error', text: '当前环境不支持浏览器通知' })
            return
          }
          if (permission !== 'granted') permission = await requestNotifyPermission()
          if (permission !== 'granted') {
            setNotifyEnabled(false)
            refresh({ kind: 'error', text: '浏览器拒绝了通知权限，请在地址栏左侧的站点设置里允许通知' })
            return
          }
          setNotifyEnabled(true)
          refresh({ kind: 'ok', text: '已开启：回答完成且标签页在后台时会弹出通知' })
        })()
      }

      function test() {
        if (notifyPermission() !== 'granted') {
          refresh({ kind: 'error', text: '先勾选开关并允许通知权限' })
          return
        }
        try {
          new window.Notification('Ascoder · 测试通知', {
            body: '如果你看到这条消息，通知已生效',
            icon: ASC_BIRD_SVG_URI,
            tag: 'ascoder-test',
          })
          refresh({ kind: 'ok', text: '已发送测试通知' })
        } catch (error) {
          refresh({ kind: 'error', text: '发送失败：' + (error && error.message ? error.message : String(error)) })
        }
      }

      var permissionText = {
        granted: '已授权',
        denied: '已被拒绝（需在浏览器站点设置里恢复）',
        default: '尚未授权',
        unsupported: '当前环境不支持',
      }[state.permission] || state.permission
      var environment = notifyEnvironment()
      var environmentText = environment.secure
        ? 'HTTPS/本地访问，满足浏览器的安全上下文要求'
        : '当前 HTTP 访问不满足安全上下文，系统通知会被浏览器禁用'

      return h('div', { className: 'asc-panel', style: { maxWidth: '560px' } }, [
        h('div', { key: 'h' }, [
          h('h2', { className: 'asc-title', key: 'ti' }, '浏览器通知'),
          h('p', { className: 'asc-sub', key: 's' }, '回答完成且标签页在后台时，用系统通知提醒你；标签页在前台时不打扰。'
            + '这是每台浏览器各自的设置：未开启时进入会话会在输入框下方提示一次，普通用户可直接开启，不需要设置密码。'),
        ]),
        state.notice
          ? h('div', { className: state.notice.kind === 'error' ? 'asc-error' : 'asc-ok', role: state.notice.kind === 'error' ? 'alert' : 'status', key: 'n' },
            [h('span', { key: 'm' }, state.notice.text)])
          : null,
        h('div', { className: 'asc-section', key: 'card' }, [
          h('label', { className: 'asc-choice', key: 'toggle', style: { gap: '8px' } }, [
            h('input', {
              key: 'i',
              type: 'checkbox',
              checked: state.enabled,
              onChange: toggle,
              disabled: !environment.secure || !environment.supported,
              'aria-label': '开启回答完成通知',
            }),
            h('span', { key: 't' }, '回答完成时通知我'),
          ]),
          h('div', { className: 'asc-meta', key: 'meta' }, [
            h('span', { key: 'p' }, '权限状态：' + permissionText),
            h('span', { key: 'o' }, '访问方式：' + environment.origin),
          ]),
          h('div', {
            className: environment.secure ? 'asc-hint' : 'asc-hint asc-hint--error',
            key: 'env',
          }, environmentText),
          h('div', { className: 'asc-row', key: 'actions' }, [
            h('button', {
              key: 'test', type: 'button', className: 'asc-btn',
              onClick: test,
              'aria-label': '发送测试通知',
            }, '发送测试通知'),
            h('span', { className: 'asc-hint', key: 'h' }, '首次开启会弹出浏览器的权限请求。'),
          ]),
        ]),
      ])
    }

        /** 相对时间文案（工具最近使用）。 */
    function toolLastUsed(iso) {
      if (!iso) return '未使用'
      var then = Date.parse(iso)
      if (isNaN(then)) return '未使用'
      var seconds = Math.max(0, Math.round((Date.now() - then) / 1000))
      if (seconds < 60) return '刚刚'
      var minutes = Math.round(seconds / 60)
      if (minutes < 60) return minutes + ' 分钟前'
      var hours = Math.round(minutes / 60)
      if (hours < 24) return hours + ' 小时前'
      return Math.round(hours / 24) + ' 天前'
    }

    /**
     * 设置页的「工具」分区：列出 Agent 当前可用的全部工具与使用情况。
     *
     * Ascoder 插件工具可以在这里启停（停用后调用会被拒绝），宿主内置工具只读展示。
     */
    /**
     * 设置页「知识库」：浏览、搜索、删除 Agent 积累的知识条目。
     * 条目按分支空间隔离：全局条目（没有分支标签）对所有空间可见。
     */
    function AscoderKnowledgeSection() {
      var dataHook = React.useState({ status: 'loading', entries: [], total: 0, globalCount: 0, scopedCount: 0, error: '' })
      var data = dataHook[0]
      var setData = dataHook[1]

      var queryHook = React.useState('')
      var query = queryHook[0]
      var setQuery = queryHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      /** 已展开全文的条目 id 集合（正文默认只显示 3 行）。 */
      var expandedHook = React.useState({})
      var expanded = expandedHook[0]
      var setExpanded = expandedHook[1]

      /** 作用域筛选：全部 / 全局 / 分支空间；排序：最近创建 / 命中最多。 */
      var scopeHook = React.useState('all')
      var scopeFilter = scopeHook[0]
      var setScopeFilter = scopeHook[1]
      var sortHook = React.useState('recent')
      var sortMode = sortHook[0]
      var setSortMode = sortHook[1]

      /** 清理「从未命中」知识前的二次确认。 */
      var confirmHook = React.useState(false)
      var confirmClean = confirmHook[0]
      var setConfirmClean = confirmHook[1]

      function toggleExpand(id) {
        setExpanded(function (previous) {
          var next = Object.assign({}, previous)
          if (next[id]) delete next[id]
          else next[id] = true
          return next
        })
      }

      var load = React.useCallback(function (keyword) {
        var suffix = keyword && keyword !== '' ? '?query=' + encodeURIComponent(keyword) + '&limit=300' : '?limit=300'
        apiGet('/api/ascoder/knowledge' + suffix)
          .then(function (payload) {
            setData({
              status: 'ready',
              entries: (payload && payload.entries) || [],
              total: (payload && payload.total) || 0,
              globalCount: (payload && payload.globalCount) || 0,
              scopedCount: (payload && payload.scopedCount) || 0,
              error: '',
            })
          })
          .catch(function (failure) {
            setData({ status: 'error', entries: [], total: 0, globalCount: 0, scopedCount: 0, error: failure.message })
          })
      }, [])

      React.useEffect(function () { load('') }, [load])

      function submitSearch(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault()
        load(query.trim())
      }

      function remove(entry) {
        if (busy !== '') return
        setBusy(entry.id)
        setNotice(null)
        apiAction({ op: 'knowledge.delete', id: entry.id, reason: '用户从设置页删除' })
          .then(function () {
            setNotice({ kind: 'ok', text: '已删除：' + entry.term })
            load(query.trim())
          })
          .catch(function (failure) { setNotice({ kind: 'error', text: failure.message }) })
          .then(function () { setBusy('') })
      }

      /** 逐条删除从未命中的知识；串行调用，避免并发写同一个文件。 */
      function cleanUnused(list) {
        if (busy !== '' || list.length === 0) return
        setBusy('__clean__')
        setNotice(null)
        var pending = list.slice()
        var removed = 0
        function step() {
          if (pending.length === 0) {
            setNotice({ kind: 'ok', text: '已清理 ' + removed + ' 条从未命中的知识' })
            setConfirmClean(false)
            setBusy('')
            load(query.trim())
            return
          }
          var entry = pending.shift()
          apiAction({ op: 'knowledge.delete', id: entry.id, reason: '清理从未命中的知识' })
            .then(function () { removed += 1; step() })
            .catch(function (failure) {
              setNotice({ kind: 'error', text: '清理中断（已删除 ' + removed + ' 条）：' + failure.message })
              setConfirmClean(false)
              setBusy('')
              load(query.trim())
            })
        }
        step()
      }

      // 筛选 + 排序都在前端做：一次拉全量（最多 300 条），切换不需要再打接口
      var allEntries = data.entries || []
      var visibleEntries = allEntries.filter(function (entry) {
        if (scopeFilter === 'global') return !entry.spaceBranch
        if (scopeFilter === 'scoped') return !!entry.spaceBranch
        return true
      })
      if (sortMode === 'hits') {
        visibleEntries = visibleEntries.slice().sort(function (left, right) {
          return (right.hits || 0) - (left.hits || 0)
        })
      }
      // 清理只针对当前可见的、从未命中过的条目
      var unusedEntries = visibleEntries.filter(function (entry) { return (entry.hits || 0) === 0 })
      var unusedCount = unusedEntries.length

      return h('div', { className: 'asc-panel', style: { maxWidth: '760px' } }, [
        h('div', { className: 'asc-sectionHead', key: 'head' }, [
          h('h3', { className: 'asc-sectionTitle', key: 't' }, '知识库'),
          h('div', { className: 'asc-actions', key: 'a' }, [
            data.status === 'ready' && unusedCount > 0
              ? h('button', {
                key: 'clean', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
                'aria-label': '清理从未命中的知识',
                disabled: busy !== '',
                onClick: function () { setConfirmClean(true); setNotice(null) },
              }, '清理未使用（' + unusedCount + '）')
              : null,
            h('button', {
              key: 'refresh', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
              onClick: function () { load(query.trim()) }, 'aria-label': '刷新知识库',
            }, '刷新'),
          ]),
        ]),
        h('p', { className: 'asc-hint', key: 'sum' },
          'Agent 在对话里积累的团队知识，共 ' + data.total + ' 条（全局 ' + data.globalCount + ' 条 / 分支空间 ' + data.scopedCount + ' 条）。'
          + '分支条目的标签显示它属于哪个分支，只在对应分支空间里可见；全局条目对所有空间可见。'),
        h('form', { className: 'asc-knSearch', key: 'search', onSubmit: submitSearch }, [
          h('input', {
            key: 'input', className: 'asc-input', type: 'search', value: query,
            placeholder: '搜索术语 / 结论 / 标签…', 'aria-label': '搜索知识库',
            onChange: function (event) { setQuery(event.target.value) },
            style: { flex: '1' },
          }),
          h('button', { key: 'go', type: 'submit', className: 'asc-btn asc-btn--quiet asc-btn--sm' }, '搜索'),
          query === '' ? null : h('button', {
            key: 'clear', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
            onClick: function () { setQuery(''); load('') },
          }, '清除'),
        ]),
        h('div', { className: 'asc-knFilters', key: 'filters' }, [
          h('span', { key: 'label', className: 'asc-hint', style: { margin: 0 } }, '作用域'),
          [['all', '全部'], ['global', '全局（' + data.globalCount + '）'], ['scoped', '分支空间（' + data.scopedCount + '）']].map(function (pair) {
            return h('button', {
              key: 'f' + pair[0],
              type: 'button',
              className: 'asc-filterChip' + (scopeFilter === pair[0] ? ' asc-filterChip--active' : ''),
              'aria-pressed': scopeFilter === pair[0] ? 'true' : 'false',
              onClick: function () { setScopeFilter(pair[0]) },
            }, pair[1])
          }),
          h('button', {
            key: 'sort',
            type: 'button',
            className: 'asc-filterChip asc-filterChip--sort',
            title: '切换排序方式',
            onClick: function () { setSortMode(sortMode === 'recent' ? 'hits' : 'recent') },
          }, sortMode === 'recent' ? '排序：最近创建' : '排序：命中最多'),
        ]),
        confirmClean
          ? h('div', { className: 'asc-knConfirm', key: 'confirm', role: 'alertdialog', 'aria-label': '确认清理未使用的知识' }, [
            h('span', { key: 't', className: 'asc-knConfirmText' },
              '将删除 ' + unusedCount + ' 条「命中 0 次」的知识（从未被检索到），删除会记入事件日志。确定继续？'),
            h('button', {
              key: 'ok', type: 'button', className: 'asc-btn asc-btn--danger asc-btn--sm',
              disabled: busy !== '', onClick: function () { cleanUnused(unusedEntries) },
            }, busy === '__clean__' ? '清理中…' : '确认清理'),
            h('button', {
              key: 'no', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
              disabled: busy !== '', onClick: function () { setConfirmClean(false) },
            }, '取消'),
          ])
          : null,
        notice ? h('div', { key: 'notice', className: 'asc-hint ' + (notice.kind === 'error' ? 'asc-hint--error' : 'asc-hint--ok'), role: 'status' }, notice.text) : null,
        data.status === 'error' ? h('div', { className: 'asc-hint asc-hint--error', key: 'err', role: 'alert' }, '加载失败：' + data.error) : null,
        data.status === 'ready' && allEntries.length === 0
          ? h('p', { className: 'asc-hint', key: 'empty' }, query === '' ? '还没有知识条目：在对话里让 Agent 记住结论即可积累。' : '没有匹配的条目。')
          : null,
        data.status === 'ready' && allEntries.length > 0 && visibleEntries.length === 0
          ? h('p', { className: 'asc-hint', key: 'emptyFilter' }, scopeFilter === 'scoped' ? '还没有分支空间专属的知识条目。' : '还没有全局知识条目。')
          : null,
        visibleEntries.map(function (entry) {
          var stats = ['命中 ' + (entry.hits || 0) + ' 次', '创建 ' + shortTime(entry.createdAt)]
          var definition = entry.definition || ''
          // 正文超过 3 行（约 120 字）才值得给展开按钮
          var longText = definition.length > 120
          var isOpen = !!expanded[entry.id]
          return h('div', { className: 'asc-toolRow', key: entry.id, role: 'group', 'aria-label': '知识：' + entry.term }, [
            h('div', { className: 'asc-toolMain', key: 'main' }, [
              h('div', { className: 'asc-toolName', key: 'n' }, [
                h('span', { key: 'term' }, entry.term),
                entry.spaceBranch
                  ? h('span', { className: 'asc-knScope', key: 'scope' }, entry.spaceBranch)
                  : h('span', { className: 'asc-knScope', key: 'scope' }, '全局'),
                h('span', { className: 'asc-toolBadge', key: 'kind', style: { color: 'var(--asc-ink-3)', background: 'color-mix(in srgb,var(--asc-ink-3) 12%,transparent)' } }, entry.kind),
              ]),
              h('div', { className: 'asc-knDefinition' + (isOpen ? ' asc-knDefinition--open' : ''), key: 'def' }, definition),
              longText
                ? h('button', {
                  key: 'more', type: 'button', className: 'asc-knMore',
                  'aria-expanded': isOpen ? 'true' : 'false',
                  onClick: function () { toggleExpand(entry.id) },
                }, isOpen ? '收起' : '展开全文（' + definition.length + ' 字）')
                : null,
              h('div', { className: 'asc-toolStats', key: 's' }, stats.map(function (text, index) {
                return h('span', { key: index }, text)
              })),
            ]),
            h('div', { className: 'asc-toolSide', key: 'side' }, [
              h('button', {
                key: 'del', type: 'button', className: 'asc-btn asc-btn--danger asc-btn--sm',
                disabled: busy !== '', 'aria-label': '删除知识：' + entry.term,
                onClick: function () { remove(entry) },
              }, busy === entry.id ? '删除中…' : '删除'),
            ]),
          ])
        }),
      ])
    }

    /**
     * 「关于」节：版本号与运行环境。
     *
     * 版本号原本裸露在页面头部（产品界面不该像发布页贴版本），移到这里的关于节更有意义，
     * 同时展示项目/仓库/空间计数与数据目录，排障时一眼能看到实际部署形态。
     */
    function AscoderAboutSection() {
      var stateHook = React.useState({ status: 'loading', version: '', projects: 0, repositories: 0, spaces: 0, root: '', error: '' })
      var data = stateHook[0]
      var setData = stateHook[1]

      React.useEffect(function () {
        apiGet('/api/ascoder/state')
          .then(function (payload) {
            var projects = (payload && payload.projects) || []
            var spaces = 0
            projects.forEach(function (project) { spaces += (project.spaces || []).length })
            setData({
              status: 'ready',
              version: (payload && payload.version) || '',
              projects: projects.length,
              repositories: ((payload && payload.repositories) || []).length,
              spaces: spaces,
              root: (payload && payload.projectsDir) || '',
              error: '',
            })
          })
          .catch(function (failure) {
            setData({ status: 'error', version: '', projects: 0, repositories: 0, spaces: 0, root: '', error: failure.message })
          })
      }, [])

      var rows = [
        ['插件版本', data.version ? 'v' + data.version : '—'],
        ['项目 / 仓库 / 分支空间', data.projects + ' / ' + data.repositories + ' / ' + data.spaces],
        ['数据目录', data.root || '—'],
      ]
      return h('div', { className: 'asc-panel', style: { maxWidth: '760px' } }, [
        h('div', { className: 'asc-sectionHead', key: 'head' }, [
          h('h3', { className: 'asc-sectionTitle', key: 't' }, '关于'),
        ]),
        h('p', { className: 'asc-hint', key: 'desc' }, 'Ascoder 代码智能助手：为分支空间提供语义检索、提交追溯与团队知识沉淀。'),
        data.status === 'error'
          ? h('div', { className: 'asc-hint asc-hint--error', key: 'err', role: 'alert' }, '读取运行信息失败：' + data.error)
          : null,
        h('dl', { className: 'asc-aboutList', key: 'list' }, rows.map(function (row, index) {
          return h('div', { className: 'asc-aboutRow', key: index }, [
            h('dt', { key: 'k' }, row[0]),
            h('dd', { key: 'v' }, row[1]),
          ])
        })),
      ])
    }

    function AscoderToolsSection() {
      var dataHook = React.useState({ status: 'loading', tools: [], clis: [], error: '' })
      var data = dataHook[0]
      var setData = dataHook[1]

      var busyHook = React.useState('')
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/tools')
          .then(function (payload) {
            setData({
              status: 'ready',
              tools: (payload && payload.tools) || [],
              clis: (payload && payload.clis) || [],
              error: '',
            })
          })
          .catch(function (failure) {
            setData({ status: 'error', tools: [], clis: [], error: failure.message })
          })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      function toggle(tool) {
        if (busy !== '') return
        setBusy(tool.name)
        setNotice(null)
        apiAction({ op: 'tool.toggle', name: tool.name, enabled: !tool.enabled })
          .then(function () {
            setNotice({ kind: 'ok', text: (tool.enabled ? '已停用 ' : '已启用 ') + tool.name })
            reload()
          })
          .catch(function (failure) { setNotice({ kind: 'error', text: failure.message }) })
          .then(function () { setBusy('') })
      }

      function reset(name) {
        if (busy !== '') return
        setBusy(name || '*')
        setNotice(null)
        apiAction(name ? { op: 'tool.reset', name: name } : { op: 'tool.reset' })
          .then(function () {
            setNotice({ kind: 'ok', text: name ? '已清零 ' + name + ' 的统计' : '已清零全部工具统计' })
            reload()
          })
          .catch(function (failure) { setNotice({ kind: 'error', text: failure.message }) })
          .then(function () { setBusy('') })
      }

      var ascoderTools = data.tools.filter(function (tool) { return tool.group === 'ascoder' })
      var hostTools = data.tools.filter(function (tool) { return tool.group !== 'ascoder' })
      var disabledCount = ascoderTools.filter(function (tool) { return !tool.enabled }).length

      function toolRow(tool) {
        var stats = [
          '调用 ' + tool.calls + ' 次',
          tool.errors > 0 ? '失败 ' + tool.errors + ' 次' : null,
          '最近 ' + toolLastUsed(tool.lastAt),
          tool.lastMs !== undefined ? '耗时 ' + tool.lastMs + 'ms' : null,
        ].filter(Boolean)
        return h('div', { className: 'asc-toolRow', key: tool.name, role: 'group', 'aria-label': '工具 ' + tool.name }, [
          h('div', { className: 'asc-toolMain', key: 'main' }, [
            h('div', { className: 'asc-toolName', key: 'n' }, [
              h('span', { key: 'name' }, tool.name),
              tool.enabled ? null : h('span', { className: 'asc-toolBadge', key: 'b' }, '已停用'),
            ]),
            h('div', { className: 'asc-toolDesc', key: 'd', title: tool.description }, tool.description || '（无描述）'),
            h('div', { className: 'asc-toolStats', key: 's' }, stats.map(function (text, index) {
              return h('span', { key: index }, text)
            })),
            tool.lastError ? h('div', { className: 'asc-toolErr', key: 'e', title: tool.lastError }, '最近失败：' + tool.lastError) : null,
          ]),
          h('div', { className: 'asc-toolSide', key: 'side' }, [
            tool.manageable
              ? h('button', {
                key: 'sw',
                type: 'button',
                className: 'asc-switch',
                role: 'switch',
                'aria-checked': tool.enabled ? 'true' : 'false',
                'aria-label': (tool.enabled ? '停用 ' : '启用 ') + tool.name,
                disabled: busy !== '',
                onClick: function () { toggle(tool) },
              })
              : h('span', { key: 'ro', className: 'asc-hint' }, tool.source || '宿主提供'),
            h('button', {
              key: 'reset',
              type: 'button',
              className: 'asc-btn asc-btn--quiet asc-btn--sm',
              onClick: function () { reset(tool.name) },
              disabled: busy !== '',
              'aria-label': '清零 ' + tool.name + ' 的统计',
            }, '清零'),
          ]),
        ])
      }

      return h('div', { className: 'asc-panel', style: { maxWidth: '720px' } }, [
        h('div', { className: 'asc-sectionHead', key: 'head' }, [
          h('h3', { className: 'asc-sectionTitle', key: 't' }, '工具'),
          h('div', { className: 'asc-actions', key: 'a' }, [
            h('button', {
              key: 'refresh', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
              onClick: reload, 'aria-label': '刷新工具列表',
            }, '刷新'),
            h('button', {
              key: 'resetAll', type: 'button', className: 'asc-btn asc-btn--quiet asc-btn--sm',
              onClick: function () { reset('') }, disabled: busy !== '' || data.tools.length === 0,
              'aria-label': '清零全部工具统计',
            }, '清零统计'),
          ]),
        ]),
        h('p', { className: 'asc-hint', key: 'sum' },
          'Agent 当前可用 ' + data.tools.length + ' 个工具：Ascoder 插件 ' + ascoderTools.length
          + ' 个（可启停' + (disabledCount > 0 ? '，已停用 ' + disabledCount + ' 个' : '') + '）、宿主内置 ' + hostTools.length + ' 个（含各 Agent 预设注入的工具）。'),
        data.status === 'ready' && data.clis.length > 0
          ? h('div', { className: 'asc-cliCard', key: 'cli', role: 'group', 'aria-label': '命令行工具可用性' }, [
            h('div', { className: 'asc-cliHead', key: 'h' }, [
              h('span', { className: 'asc-cliTitle', key: 't' }, '命令行工具'),
              h('span', { className: 'asc-hint', key: 'n' }, 'Agent 通过宿主的 shell 工具（bash）调用，不是独立工具'),
            ]),
            data.clis.map(function (cli) {
              return h('div', { className: 'asc-cliRow', key: cli.name }, [
                h('span', { className: 'asc-cliDot' + (cli.available ? ' asc-cliDot--ok' : ''), key: 'd', 'aria-hidden': 'true' }),
                h('span', { className: 'asc-cliName', key: 'n' }, cli.name),
                h('span', { className: 'asc-hint', key: 'p' }, cli.purpose),
                h('span', { className: 'asc-cliState' + (cli.available ? '' : ' asc-cliState--off'), key: 's' },
                  cli.available ? (cli.detail || '可用') : '不可用'),
              ])
            }),
          ])
          : null,
        data.status === 'error'
          ? h('div', { className: 'asc-error', role: 'alert', key: 'err' }, [h('span', { key: 'm' }, data.error)])
          : null,
        data.status === 'loading'
          ? h('div', { className: 'asc-skeleton', key: 'sk' }, [0, 1, 2].map(function (slot) {
            return h('div', { className: 'asc-skelCard', key: slot, style: { height: '56px' } })
          }))
          : null,
        data.status === 'ready' && ascoderTools.length > 0
          ? h('div', { className: 'asc-toolGroup', key: 'asc' }, [
            h('div', { className: 'asc-groupLabel', key: 'l' }, 'Ascoder 插件工具（可在设置里启停）'),
            ascoderTools.map(toolRow),
          ])
          : null,
        data.status === 'ready' && hostTools.length > 0
          ? h('div', { className: 'asc-toolGroup', key: 'host' }, [
            h('div', { className: 'asc-groupLabel', key: 'l' }, '宿主内置工具（由 DSH 提供，此处只读）'),
            hostTools.map(toolRow),
          ])
          : null,
        data.status === 'ready' && data.tools.length === 0
          ? h('div', { className: 'asc-hint', key: 'empty' }, '当前没有可用工具')
          : null,
        notice
          ? h('div', { className: notice.kind === 'error' ? 'asc-error' : 'asc-ok', role: notice.kind === 'error' ? 'alert' : 'status', key: 'n' },
            [h('span', { key: 'm' }, notice.text)])
          : null,
        h('p', { className: 'asc-hint', key: 'tip' },
          '停用只影响 Ascoder 自己的工具：模型再调用会收到「已在设置中停用」；使用统计记录调用次数、失败次数与耗时。'),
      ])
    }

    /** 设置页密码管理：放在 DSH 设置的「设置密码」分区里。 */
    function AscoderSecuritySection() {
      var stateHook = React.useState({ status: 'loading', usesDefault: true })
      var status = stateHook[0]
      var setStatus = stateHook[1]

      var formHook = React.useState({ current: '', next: '', confirm: '' })
      var form = formHook[0]
      var setForm = formHook[1]

      var busyHook = React.useState(false)
      var busy = busyHook[0]
      var setBusy = busyHook[1]

      var noticeHook = React.useState(null)
      var notice = noticeHook[0]
      var setNotice = noticeHook[1]

      var reload = React.useCallback(function () {
        apiGet('/api/ascoder/state')
          .then(function (data) {
            var security = (data && data.security) || {}
            setStatus({ status: 'ready', usesDefault: security.usesDefaultPassword !== false })
          })
          .catch(function () { setStatus({ status: 'error', usesDefault: false }) })
      }, [])

      React.useEffect(function () { reload() }, [reload])

      function submit(event) {
        event.preventDefault()
        if (busy) return
        if (form.next.length < 6) {
          setNotice({ kind: 'error', text: '新密码至少 6 位' })
          return
        }
        if (form.next !== form.confirm) {
          setNotice({ kind: 'error', text: '两次输入的新密码不一致' })
          return
        }
        setBusy(true)
        setNotice(null)
        ;(async function () {
          try {
            await apiAction({ op: 'auth.change', password: form.current, nextPassword: form.next })
            setForm({ current: '', next: '', confirm: '' })
            setNotice({ kind: 'ok', text: '密码已更新，下次进入设置时使用新密码' })
            setStatus({ status: 'ready', usesDefault: false })
          } catch (failure) {
            setNotice({ kind: 'error', text: failure.message })
          } finally {
            setBusy(false)
          }
        })()
      }

      return h('div', { className: 'asc-panel', style: { maxWidth: '560px' } }, [
        h('div', { className: 'asc-header', key: 'h' }, [
          h('div', { key: 't' }, [
            h('h2', { className: 'asc-title', key: 'ti' }, '设置密码'),
            h('p', { className: 'asc-sub', key: 's' }, '进入 DSH 设置页需要这个密码；修改后立即生效。'),
          ]),
          status.status === 'ready' && status.usesDefault
            ? h('span', { className: 'asc-pill asc-pill--stale', key: 'pill' }, '仍在使用初始密码')
            : null,
        ]),
        notice
          ? h('div', {
            className: notice.kind === 'error' ? 'asc-error' : 'asc-ok',
            role: notice.kind === 'error' ? 'alert' : 'status',
            key: 'notice',
          }, [h('span', { key: 'm' }, notice.text)])
          : null,
        h('form', { className: 'asc-form', key: 'f', onSubmit: submit }, [
          h('div', { className: 'asc-field', key: 'c' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-pw-current', key: 'l' }, '当前密码'),
            h('input', {
              key: 'i', id: 'asc-pw-current', className: 'asc-input', type: 'password',
              value: form.current, autoComplete: 'current-password',
              placeholder: status.usesDefault ? '出厂默认密码，建议尽快修改' : '',
              onChange: function (event) { setForm({ current: event.target.value, next: form.next, confirm: form.confirm }) },
            }),
          ]),
          h('div', { className: 'asc-field', key: 'n' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-pw-next', key: 'l' }, '新密码（至少 6 位）'),
            h('input', {
              key: 'i', id: 'asc-pw-next', className: 'asc-input', type: 'password',
              value: form.next, autoComplete: 'new-password',
              onChange: function (event) { setForm({ current: form.current, next: event.target.value, confirm: form.confirm }) },
            }),
          ]),
          h('div', { className: 'asc-field', key: 'r' }, [
            h('label', { className: 'asc-label', htmlFor: 'asc-pw-confirm', key: 'l' }, '确认新密码'),
            h('input', {
              key: 'i', id: 'asc-pw-confirm', className: 'asc-input', type: 'password',
              value: form.confirm, autoComplete: 'new-password',
              onChange: function (event) { setForm({ current: form.current, next: form.next, confirm: event.target.value }) },
            }),
          ]),
          h('div', { className: 'asc-row', key: 'a' }, [
            h('button', {
              key: 'b', type: 'submit', className: 'asc-btn asc-btn--primary',
              disabled: busy || form.current === '' || form.next === '' || form.confirm === '',
            }, busy ? '保存中…' : '修改密码'),
            h('span', { className: 'asc-hint', key: 'h' }, '密码以 scrypt 加盐哈希保存，不存明文。'),
          ]),
        ]),
        h('div', { className: 'asc-hint', key: 'note', style: { marginTop: '4px' } },
          '忘记密码：修改 profile 的 cordis.patch.yml 里的 adminPassword，并清除插件保存的密码记录' +
          '（README「设置密码」一节有清理方法），重启后生效。'),
      ])
    }

    /** 文案补丁：宿主部分文案与入口来自其自身 locale/槽位，无法从插件层覆盖，这里做最小 DOM 纠正。 */
    var TEXT_RULES = [
      ['描述你想要构建的内容, / 调用指令, @ 文件或对话', '描述你的代码问题'],
      ['描述你想要构建的内容，/ 调用指令，@ 文件或对话', '描述你的代码问题'],
      ['Describe what you want to build, / for commands, @ for files or conversations', 'Describe your question about the code'],
      ['探索未至之境', 'Ascoder 代码理解'],
      ['预览版', 'Ascoder'],
      ['选择一个工作区开始', '选择一个代码目录开始'],
      ['选择工作区', '选择代码目录'],
      ['添加工作区', '添加项目'],
      ['新建工作区', '新建项目'],
      ['默认工作区', '默认项目'],
      ['工作区', '项目'],
      ['深度求索中', '正在调查代码'],
      ['Deep diving', 'Investigating the code'],
    ]
    /** 属性级替换（aria-label / title / placeholder 等宿主文案）。 */
    var ATTR_RULES = [
      ['描述你想要构建的内容，/ 调用指令，@ 文件或对话', '描述你的代码问题，Enter 发送'],
      ['Describe what you want to build, / for commands, @ for files or conversations', 'Describe your question about the code'],
      ['描述你想要构建的内容', '描述你的代码问题'],
      ['，/ 调用指令，@ 文件或对话', ''],
      [', / 调用指令, @ 文件或对话', ''],
      ['/ 调用指令，@ 文件或对话', ''],
      [', / for commands, @ for files or conversations', ''],
      ['选择一个工作区开始', '选择一个代码目录开始'],
      ['选择工作区', '选择代码目录'],
      ['添加工作区', '添加项目'],
      ['新建工作区', '新建项目'],
      ['工作区', '项目'],
      ['深度求索中', '正在调查代码'],
      ['Deep diving', 'Investigating the code'],
    ]
    /** 参与替换的属性名。 */
    var ATTR_NAMES = ['aria-label', 'title', 'data-placeholder', 'placeholder']
    /** 需要隐藏的 DSH 专属入口（按钮文案或 aria-label）。 */
    var HIDDEN_LABELS = ['插件']
    /** 需要隐藏的宿主控件 aria-label：Ascoder 用不到这些 DSH 入口。 */
    var HIDDEN_ARIA = [
      '添加项目',            // 侧栏「加目录」：项目统一在设置里管理
      '选择代码目录',         // 输入区目录选择器：项目已由侧栏决定
      '账号菜单',            // DSH 账号入口（设置改从品牌入口进）
      '打开右侧边栏', '收起右侧边栏', '新标签页', '分栏', '全屏',
      '添加文件或调用指令',    // 附件/命令已禁用，按钮无实际功能
    ]
    /** 文本节点遍历的开销保护。 */
    var COPY_PATCH_MAX_NODES = 4000

    /** 该文本节点是否命中需要纠正的宿主文案。 */
    function needsTextPatch(text) {
      for (var index = 0; index < TEXT_RULES.length; index += 1) {
        if (text.indexOf(TEXT_RULES[index][0]) >= 0) return true
      }
      return false
    }

    /** 替换文本节点中的宿主文案。 */
    function replaceTextNodes(root) {
      if (!root || typeof document === 'undefined') return
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
      var visited = 0
      var node = walker.nextNode()
      while (node !== null && visited < COPY_PATCH_MAX_NODES) {
        visited += 1
        var text = node.nodeValue
        if (typeof text === 'string' && text !== '' && needsTextPatch(text)) {
          var next = text
          for (var index = 0; index < TEXT_RULES.length; index += 1) {
            next = next.split(TEXT_RULES[index][0]).join(TEXT_RULES[index][1])
          }
          if (next !== text) node.nodeValue = next
        }
        node = walker.nextNode()
      }
    }

    /** 替换宿主写在属性里的文案。 */
    function replaceAttributes(root) {
      if (!root || typeof root.querySelectorAll !== 'function') return
      var selector = '[aria-label],[title],[data-placeholder],[placeholder]'
      var elements = root.querySelectorAll(selector)
      for (var e = 0; e < elements.length; e += 1) {
        var element = elements[e]
        for (var a = 0; a < ATTR_NAMES.length; a += 1) {
          var name = ATTR_NAMES[a]
          var value = element.getAttribute(name)
          if (typeof value !== 'string' || value === '') continue
          var next = value
          for (var r = 0; r < ATTR_RULES.length; r += 1) {
            next = next.split(ATTR_RULES[r][0]).join(ATTR_RULES[r][1])
          }
          if (next !== value) element.setAttribute(name, next)
        }
      }
    }

    /** 隐藏 DSH 专属入口与未被使用的宿主控件。 */
    function hideHostControls(root) {
      if (!root || typeof root.querySelectorAll !== 'function') return
      var buttons = root.querySelectorAll('button')
      for (var b = 0; b < buttons.length; b += 1) {
        var button = buttons[b]
        if (button.dataset.ascoderHidden === 'true') continue
        // 不动 Ascoder 面板自己的控件
        if (typeof button.closest === 'function' && button.closest('.asc-panel')) continue
        var text = (button.textContent || '').trim()
        var aria = button.getAttribute('aria-label') || ''
        var hide = HIDDEN_LABELS.indexOf(text) >= 0
        for (var h = 0; h < HIDDEN_ARIA.length; h += 1) {
          if (aria === HIDDEN_ARIA[h]) hide = true
        }
        if (hide) {
          button.dataset.ascoderHidden = 'true'
          button.setAttribute('hidden', '')
          button.style.display = 'none'
        }
      }
    }

    /**
     * 运行状态文案：宿主把标签拆成逐字 shimmer，无法直接改文本；
     * 这里读回原文（含用时）写到 data 属性，由 CSS 渲染「正在调查代码」。
     * @param root - 补丁作用根节点
     */
    /** 浏览器通知：开关存在 localStorage，权限由 Notification API 管。 */
    var NOTIFY_KEY = 'ascoder.notify.enabled'
    /** 上一次补丁时是否处于运行状态（用于检测"运行结束"）。 */
    var notifyWasRunning = false

    /** 用户显式关闭过通知的标记。 */
    var NOTIFY_OFF_KEY = 'ascoder.notify.disabled'
    /** 用户在引导条里选了「不再提醒」的标记。 */
    var NOTIFY_DISMISS_KEY = 'ascoder.notify.dismissed'
    /** 本次页面会话里点过「稍后」，不再重复打扰。 */
    var dismissedThisSession = false

    /**
     * 是否应该显示「开启通知」引导条。
     *
     * 只有「从没做过选择、浏览器也还没授权」时才提示：
     * 环境不允许（HTTP 等非安全上下文）、浏览器不支持、用户主动关过、
     * 或已经点了「不再提醒」，都不打扰。
     * @returns 是否需要引导
     */
    function notifyNeedsPrompt() {
      try {
        if (window.localStorage.getItem(NOTIFY_DISMISS_KEY) === '1') return false
        if (window.localStorage.getItem(NOTIFY_OFF_KEY) === '1') return false
        if (notifyEnabled()) return false
        if (!notifyEnvironment().secure) return false
        return notifyPermission() !== 'unsupported'
      } catch (error) {
        return false
      }
    }

    /**
     * 读取通知开关。
     *
     * 通知是**每台浏览器各自的偏好**（存在 localStorage，与服务器数据无关），
     * 所以不放在需要管理密码的设置页里做唯一入口。判定顺序：
     *  1. 用户在这个浏览器上显式关过 → 关；
     *  2. 用户显式开过 → 开；
     *  3. 都没设置但浏览器已授权通知 → 视为开（老用户升级后不用重新点一次）。
     * @returns 是否启用通知
     */
    function notifyEnabled() {
      try {
        if (window.localStorage.getItem(NOTIFY_OFF_KEY) === '1') return false
        if (window.localStorage.getItem(NOTIFY_KEY) === '1') return true
        return notifyPermission() === 'granted'
      } catch (error) {
        return false
      }
    }

    /** 写入通知开关（同时清掉相反的标记，避免两者冲突）。 */
    function setNotifyEnabled(enabled) {
      try {
        if (enabled) {
          window.localStorage.setItem(NOTIFY_KEY, '1')
          window.localStorage.removeItem(NOTIFY_OFF_KEY)
        } else {
          window.localStorage.removeItem(NOTIFY_KEY)
          window.localStorage.setItem(NOTIFY_OFF_KEY, '1')
        }
      } catch (error) {
        // 隐私模式下写入失败不影响当前会话
      }
    }

    /**
     * 当前环境是否允许系统通知：浏览器要求安全上下文（HTTPS 或 localhost）。
     * @returns {{ secure: boolean, supported: boolean, origin: string }}
     */
    function notifyEnvironment() {
      var secure = typeof window !== 'undefined' && window.isSecureContext === true
      return {
        secure: secure,
        supported: notifyPermission() !== 'unsupported',
        origin: typeof window !== 'undefined' && window.location ? window.location.origin : '',
      }
    }

    /** 当前通知权限；环境不支持时返回 'unsupported'。 */
    function notifyPermission() {
      if (typeof window === 'undefined' || typeof window.Notification !== 'function') return 'unsupported'
      return window.Notification.permission
    }

    /** 请求通知权限（必须在用户手势里调用）。 */
    function requestNotifyPermission() {
      if (notifyPermission() === 'unsupported') return Promise.resolve('unsupported')
      try {
        return window.Notification.requestPermission()
      } catch (error) {
        return Promise.resolve('denied')
      }
    }

    /** 当前选中会话的标题（用于通知文案）。 */
    function selectedSessionTitle() {
      if (typeof document === 'undefined') return ''
      var row = document.querySelector('[role="treeitem"][aria-selected="true"]')
      if (!row) return ''
      var text = (row.innerText || '').split('\n')[0].trim()
      return text
    }

    /**
     * 发一条完成通知。
     * @param body - 通知正文
     */
    function showFinishNotification(body) {
      if (!notifyEnabled() || notifyPermission() !== 'granted') return
      try {
        var notification = new window.Notification('Ascoder · 回答完成', {
          body: body || '回答已生成，点击查看',
          icon: ASC_BIRD_SVG_URI,
          tag: 'ascoder-answer-done',
        })
        notification.onclick = function () {
          try {
            window.focus()
          } catch (error) {
            // 部分环境不允许聚焦，忽略
          }
          notification.close()
        }
      } catch (error) {
        // 通知失败不影响主流程
      }
    }

    /**
     * 跟踪运行状态，在"运行中 → 空闲"且页面不可见时通知。
     * @param hasRunning - 当前是否有运行中的回答
     */
    function trackRunningForNotify(hasRunning) {
      if (!hasRunning) {
        if (notifyWasRunning) {
          notifyWasRunning = false
          if (typeof document !== 'undefined' && document.hidden) {
            showFinishNotification(selectedSessionTitle() || '回答已生成，点击查看')
          }
        }
        return
      }
      notifyWasRunning = true
    }

    function patchRunningStatus(root) {
      if (!root || typeof root.querySelectorAll !== 'function') return
      var rows = root.querySelectorAll('[data-chat-running]')
      trackRunningForNotify(rows.length > 0)
      for (var index = 0; index < rows.length; index += 1) {
        var row = rows[index]
        var content = row.querySelector('[class*="runningContent"]')
        if (!content) continue
        var textEl = row.querySelector('[class*="runningText"]')
        var source = textEl ? (textEl.textContent || '') : ''
        var duration = ''
        var matched = source.match(/用时\s*([^·\s]+(?:\s*[^·\s]+)?)/)
        if (matched) duration = '用时 ' + matched[1].trim()
        var label = '正在调查代码' + (duration ? '，' + duration : '') + ' ···'
        if (content.getAttribute('data-asc-running') !== label) {
          content.setAttribute('data-asc-running', label)
        }
        if (!content.querySelector('.asc-bird-icon')) {
          var trail = document.createElement('span')
          trail.className = 'asc-bird-trail'
          trail.setAttribute('aria-hidden', 'true')
          var bird = document.createElement('span')
          bird.className = 'asc-bird-icon'
          bird.setAttribute('aria-hidden', 'true')
          content.insertBefore(bird, content.firstChild)
          content.insertBefore(trail, bird)
        }
      }
    }

    /** 安装文案补丁：首帧 + 之后 DOM 变化时增量纠正。 */
    function installCopyPatch() {
      if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return
      if (window.__ascoderCopyPatched === true) return
      window.__ascoderCopyPatched = true
      var apply = function () {
        var body = document.body
        if (!body) return
        replaceTextNodes(body)
        replaceAttributes(body)
        decorateHeroBrand(body)
        hideHostControls(body)
        patchRunningStatus(body)
      }
      apply()
      // 同步打补丁：MutationObserver 回调在渲染前（微任务）执行，
      // 因此「探索未至之境 → Ascoder 代码理解」这类替换不会出现肉眼可见的闪烁。
      var applying = false
      var applyNow = function () {
        if (applying) return
        applying = true
        try {
          apply()
        } finally {
          applying = false
        }
      }
      var observer = new MutationObserver(applyNow)
      observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR_NAMES })
    }

    /** 给首页大标题「Ascoder 代码理解」里的 Ascoder 套上渐变与流光。 */
    function decorateHeroBrand(root) {
      if (!root || typeof document === 'undefined' || typeof document.createTreeWalker !== 'function') return
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
      var node = walker.nextNode()
      while (node !== null) {
        var text = node.nodeValue
        if (typeof text === 'string' && text.trim() === 'Ascoder 代码理解') {
          var parent = node.parentNode
          if (parent && parent.nodeType === 1 && !parent.querySelector('.asc-hero-word')) {
            var word = document.createElement('span')
            word.className = 'asc-wm-text asc-wm-text--hero asc-hero-word'
            word.textContent = 'Ascoder'
            var rest = document.createTextNode(text.slice(text.indexOf('Ascoder') + 'Ascoder'.length))
            parent.replaceChild(rest, node)
            parent.insertBefore(word, rest)
          }
        }
        node = walker.nextNode()
      }
    }

    /** 记住上次使用的项目（多项目时首页优先回到它）。 */
    var LAST_PROJECT_KEY = 'ascoder.lastProjectId'

    /** 读取上次使用的项目 id。 */
    function readLastProjectId() {
      try {
        return window.localStorage.getItem(LAST_PROJECT_KEY)
      } catch (error) {
        return null
      }
    }

    /** 记录当前使用的项目 id。 */
    function rememberProjectId(projectId) {
      try {
        window.localStorage.setItem(LAST_PROJECT_KEY, projectId)
      } catch (error) {
        // 隐私模式等场景写入失败不影响使用
      }
    }

    /** 浏览器端必需的插槽注册表。 */
    var inject = ['slots']

    /** 插件上下文：组件读取可选服务（如 uiWorkspace）时用。 */
    var pluginContext = null

    /**
     * 关闭宿主浮层（设置面板等）。
     * 宿主未暴露"关闭设置"的公开 API，这里发送它已监听的 Escape 手势。
     */
    function dismissHostOverlay() {
      if (typeof window === 'undefined' || typeof KeyboardEvent !== 'function') return
      var options = { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true }
      window.dispatchEvent(new KeyboardEvent('keydown', options))
      if (typeof document !== 'undefined') document.dispatchEvent(new KeyboardEvent('keydown', options))
    }

    /** 从上下文取一个可选服务。 */
    function optionalService(name) {
      if (!pluginContext || typeof pluginContext.get !== 'function') return undefined
      try {
        return pluginContext.get(name)
      } catch (error) {
        return undefined
      }
    }

    /** 客户端入口：品牌插槽 + 项目管理设置分区 + 文档外壳。 */
    function apply(ctx) {
      pluginContext = ctx
      ensureStyle(STYLE_ID, CSS, 'dsh-ascoder')
      installSidebarFilter()
      installSettingsShortcutGate()
      ensureStyle(BRAND_STYLE_ID, BRAND_CSS, 'dsh-ascoder')
      applyDocumentChrome()
      installCopyPatch()

      ctx.slots.inject('sidebar.brand.mark', function () {
        return ctx.slots.register({ name: 'sidebar.brand.mark' }, AscoderMark)
      })

      ctx.slots.inject('sidebar.brand.name', function () {
        return ctx.slots.register({ name: 'sidebar.brand.name' }, AscoderName)
      })

      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-home', order: 10 }, AscoderHomeOverlay)
      })
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-switch', order: 20 }, AscoderSwitchOverlay)
      })

      // 通知引导：不需要设置页密码，普通用户也能自己开（纯浏览器本地偏好）
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-notify-prompt', order: 30 }, AscoderNotifyPrompt)
      })

      // 全局任务进度：任何页面都能看到正在跑的任务（右下角卡片）
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-task-dock', order: 25 }, AscoderTaskDock)
      })
      ctx.slots.inject('conversation.input.left', function () {
        return ctx.slots.register({ name: 'conversation.input.left', id: 'ascoder-role', order: 30 }, AscoderRolePicker)
      })

      // 通知引导：不需要设置页密码，普通用户也能自己开（纯浏览器本地偏好）
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-notify-prompt', order: 30 }, AscoderNotifyPrompt)
      })

      // 全局任务进度：任何页面都能看到正在跑的任务（右下角卡片）
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register({ name: 'shell.overlay', id: 'ascoder-task-dock', order: 25 }, AscoderTaskDock)
      })
      ctx.slots.inject('conversation.input.left', function () {
        return ctx.slots.register({ name: 'conversation.input.left', id: 'ascoder-branch', order: 40 }, AscoderBranchBar)
      })

      // 全局导航位：无会话时也存在，因此空会话/新会话也能返回项目页
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-credentials',
          order: 57,
          label: function () { return '仓库凭证' },
        }, AscoderCredentialSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-knowledge',
          order: 64,
          label: function () { return '知识库' },
        }, AscoderKnowledgeSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-tools',
          order: 63,
          label: function () { return '工具' },
        }, AscoderToolsSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-notify',
          order: 62,
          label: function () { return '浏览器通知' },
        }, AscoderNotifySection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-model',
          order: 58,
          label: function () { return '会话模型' },
        }, AscoderModelSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-roles',
          order: 61,
          label: function () { return '回答视角' },
        }, AscoderRolesSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-about',
          order: 70,
          label: function () { return '关于' },
        }, AscoderAboutSection)
      })

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'ascoder-security',
          order: 60,
          label: function () { return '设置密码' },
        }, AscoderSecuritySection)
      })

      ctx.slots.inject('conversation.header.leading', function () {
        return ctx.slots.register({ name: 'conversation.header.leading' }, AscoderProjectCrumb)
      })

      ctx.slots.inject('conversation.hero.brand.mark', function () {
        return ctx.slots.register({ name: 'conversation.hero.brand.mark' }, AscoderHeroMark)
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
