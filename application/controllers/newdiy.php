<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Newdiy extends CI_Controller {

	public $data=array();
	function __construct()
	{
	 	parent::__construct();
	 	$this->load->database();
	 	$this->load->helper('url');
	 	$this->load->model('show_model');
	 	$this->load->model('sqlModel');
	 	$this->load->model('dealModel');

	}
	function business()
	{
		$this->load->view('page/business',$this->data);
	}
	function neckties()
	{
		$this->load->view('page/neckties',$this->data);
	}

	function cate_show()
	{
		$query = $this->db->get('new_product_cate_global');
		foreach ($query->result_array() as $row)
		{
			$sql="SELECT title from new_seo where lang_id=1 and menu_id='{$row['menu_id']}' limit 1";
			$q = $this->db->query($sql);
			$r = $q->row_array();

		    $this->data['cate'][] = array(
		    	'product' =>$r['title'] ,
		    	'menu_id' => $row['menu_id'],
		    	'order_num' => $row['order_num'],
		    	'form_date' => $row['form_date'],
		    	'product_date' => $row['product_date']
		    	);
		}
		return $this->data;
	}

	public function index()
	{
		// $this->data['file'] = 'content';
		// $this->data=$this->cate_show();
		// $this->load->view('default',$this->data);
		$this->cate();
	}
	function cate($menu_id='280')
	{
		$this->data=$this->cate_show();
		$sql="SELECT title from new_seo where lang_id=1 and menu_id='{$menu_id}' limit 1";
		$q = $this->db->query($sql);
		$r = $q->row_array();
		$this->data['title']=$r['title'];
		$this->load->view('default',$this->data);
	}

}
