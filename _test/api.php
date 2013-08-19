<?php

header('Content-Type: application/json; charset=utf-8');

$action = isset($_GET['action']) ? $_GET['action'] : '';

$host = 'http://192.168.1.232';

if($action == 'search') {
    
    $key = isset($_GET['key']) ? $_GET['key'] : '';
    
    $url = $host . '/Handler/SearchBrandForChart?Key=' . $key;
    
    $data = file_get_contents($url);
    
    print_r($data);
    exit;    
    
} else if($action == 'search_brand_name') {
    
} else if($action == 'get_brand_data') {
    $ids = isset($_GET['brand_id']) ? $_GET['brand_id'] : '';
    
    $url = $host . '/Handler/GetDataForPreviewChart?brand_id=' . $ids;
    
    $data = file_get_contents($url);
    print_r($data);
    exit;
} else if($action == 'get_brand_data2') {
    $ids = isset($_GET['brandIDs']) ? $_GET['brandIDs'] : '';
    $mids = isset($_GET['metricsIDs']) ? $_GET['metricsIDs'] : '';
	$sDate = isset($_GET['BeginDate']) ? $_GET['BeginDate'] : '2012-07-20';
	$eDate = isset($_GET['EndDate']) ? $_GET['EndDate'] : '2012-07-26';
    
    $url = $host . '/Handler/GetDataForChart?BeginDate='.$sDate.'&EndDate='.$eDate.'&brandIDs=' . $ids;
    $url .= $mids ? '&metricsIDs='.$mids : '';    

    $data = file_get_contents($url);
    print_r($data);
    exit;
} else if($action == 'events_types') {
    
    $url = $host . '/Handler/GetEventTypeMapping';
    $data = file_get_contents($url);
    print_r($data);
    exit;
} else if($action == 'events_data') {
    
    $ids = isset($_GET['ids']) ? $_GET['ids'] : 0;
    if($ids) {
        $url = $host . '/Handler/GetEventCollection?ids=' . $ids;
        $data = file_get_contents($url);
        print_r($data);
        exit;
    }
} else if($action == 'events_value_data') {
    
    $date = isset($_REQUEST['Date']) ? $_REQUEST['Date'] : '';
    $typeid = isset($_REQUEST['TypeId']) ? $_REQUEST['TypeId'] : '';
    $bid = isset($_REQUEST['BId']) ? $_REQUEST['BId'] : '';
    
    $url = $host . '/Handler/GetEventContent?Date='.$date.'&TypeId='.$typeid.'&BId='.$bid;
    
    $data = file_get_contents($url);
    print_r($data);
    exit;    
} else if($action == 'metrics') {
    
    $bid = $_REQUEST['bid'];
    
    $url = $host. '/Handler/GetMetricsCollection?bid=' . $bid;
    $data = file_get_contents($url);
    print_r($data);
    exit;
} else if($action == 'search_brand_by_id') {
    $bid = $_REQUEST['bid'];
    
    $url = $host . '/Handler/GetBrandInfoByBIDForChart?bid=' . $bid;
    $data = file_get_contents($url);
    print_r($data);
    exit;
} else if($action == 'get_quickview_byid') {
	$id = isset($_REQUEST['quickViewID']) ? intval($_REQUEST['quickViewID']) : 0;
	if(!$id) exit(0);

	$url = $host. '/Handler/GetQuickViewInfoByIDForChart?quickViewID=' . $id;
	$data = file_get_contents($url);
	print_r($data);
	exit;
} else if($action == 'add_quickview'){
	
	$url = $host . '/Handler/QuickViewAdd';

	$data = array('data' => 11);
	echo json_encode($data);
	exit;
} else if($action == 'del_quickview_byid') {
	
	$id = $_REQUEST['quickViewID'];
	$url = $host . '/Handler/DeleteQuickViewByID?quickViewID=' .$id;
	$data = file_get_contents($url);
	print_r($data);
	exit;
} else if($action == 'get_quickview_list'){
	$url = $host . '/Handler/GetQuickViewCollection';
	$data = file_get_contents($url);
	print_r($data);
	exit;
} else if($action == 'get_def_quickview'){
	$url = $host . '/Handler/GetDefaultQuickViewInfoByIDForChart';
	$data = file_get_contents($url);
	print_r($data);
	exit;
}
?>